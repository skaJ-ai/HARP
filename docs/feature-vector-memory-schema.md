# Feature Design: Vector Memory Schema

> **문서 목적**: 구현 LLM이 HARP에 벡터 메모리 레이어를 추가하기 위한 스키마 설계 문서.
> **작성일**: 2026-03-30
> **상위 문서**: `docs/db_engineering.md`
> **변경 파일 예상 범위**: 5개 이상 (DB schema, migration, embedding service, ingest service, env/example)

---

## 0. 현재 상태 분석

현재 HARP는 아래 구조다.

- 원본 데이터 저장:
  - `sessions`
  - `messages`
  - `sources`
  - `deliverables`
- 검색:
  - Postgres FTS (`to_tsvector`, `plainto_tsquery`, `ts_rank_cd`)
- 생성 참고:
  - 같은 template type의 최근 산출물 3건

즉, **기록은 쌓이지만 semantic retrieval용 저장 계층은 없다**.

현재 원본 테이블에 바로 vector 컬럼을 넣는 대신, retrieval 전용 테이블을 별도로 두는 방향을 선택한다.

이유:

1. `deliverables.sections`는 JSONB라 section 단위 retrieval이 어렵다.
2. `sources`는 향후 chunking 기준이 바뀔 수 있다.
3. re-embedding/version 관리가 원본 테이블과 분리되어야 안전하다.

---

## 1. 핵심 설계 결정

### 1.1 별도 벡터 DB가 아니라 `Postgres + pgvector`

현재 운영 DB가 이미 PostgreSQL이고, retrieval에도 다음 필터가 필수다.

- `workspaceId`
- `templateType`
- `status`
- `sessionId`

이 metadata filter는 relational query 안에서 같이 처리하는 것이 가장 단순하다.

따라서 이번 범위는:

- Pinecone/Qdrant/Weaviate 도입 아님
- **현재 PostgreSQL 안에 vector extension 추가**

### 1.2 chat LLM과 embedding endpoint를 분리

이번 설계의 중요한 전제:

- chat/generation LLM:
  - 기존 구조 유지
  - OpenAI-compatible `/v1` endpoint 사용
- embedding:
  - 별도 internal Ollama endpoint 사용
  - `http://10.240.248.157:11434`
  - 모델: `qwen3-embedding:4b`

즉, embedding 구현은 현재 `src/lib/ai/provider.ts`의 `createOpenAI` 경로를 재사용하는 작업이 아니다.

중요:

- embedding request/response shape는 Ollama 기준으로 별도 처리해야 한다.
- 이 endpoint도 chat LLM과 마찬가지로 사내 전용이다.
- trust boundary는 동일하지만 protocol은 다르다.

### 1.3 새 테이블 하나로 시작

신규 테이블:

```text
memory_chunks
```

역할:

- retrieval 단위 저장
- 임베딩 저장
- 원본 row와의 연결
- re-embedding/version 관리

### 1.4 초기 임베딩 대상

이번 범위에서 임베딩하는 것은 두 종류뿐이다.

1. `sources.content`
2. `deliverables.sections[].content`

초기 제외:

- `messages.content`
- `draft deliverables`

이유:

- `messages`는 잡음이 많다.
- `draft`는 품질이 안정되지 않았다.

---

## 2. 신규 스키마

### 2.1 `memory_chunks` 테이블

```typescript
type MemoryChunkKind = 'deliverable_section' | 'source';
type MemoryChunkStatus = 'active' | 'superseded';
```

```typescript
const memoryChunksTable = pgTable(
  'memory_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),

    kind: text('kind').$type<MemoryChunkKind>().notNull(),
    status: text('status').$type<MemoryChunkStatus>().default('active').notNull(),

    sourceId: uuid('source_id').references(() => sourcesTable.id, { onDelete: 'cascade' }),
    deliverableId: uuid('deliverable_id').references(() => deliverablesTable.id, {
      onDelete: 'cascade',
    }),
    sessionId: uuid('session_id').references(() => sessionsTable.id, { onDelete: 'set null' }),

    templateType: text('template_type').$type<TemplateType>(),
    sectionName: text('section_name'),

    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(),

    embedding: vector('embedding', { dimensions: <QWEN3_EMBEDDING_DIM> }).notNull(),
    embeddingModel: text('embedding_model').notNull(),
    embeddingVersion: integer('embedding_version').default(1).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    workspaceIndex: index('idx_memory_chunks_workspace_id').on(table.workspaceId),
    kindIndex: index('idx_memory_chunks_kind').on(table.kind),
    templateIndex: index('idx_memory_chunks_template_type').on(table.templateType),
    sourceIndex: index('idx_memory_chunks_source_id').on(table.sourceId),
    deliverableIndex: index('idx_memory_chunks_deliverable_id').on(table.deliverableId),
    contentHashIndex: index('idx_memory_chunks_content_hash').on(table.contentHash),
    lexicalIndex: index('idx_memory_chunks_fts').using(
      'gin',
      sql`to_tsvector('simple', ${table.content})`,
    ),
    vectorIndex: index('idx_memory_chunks_embedding').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
);
```

### 2.2 컬럼 설명

| 컬럼 | 목적 |
|------|------|
| `workspaceId` | tenant boundary. 모든 retrieval의 최상위 필터 |
| `kind` | `source`와 `deliverable_section` 구분 |
| `status` | 재임베딩/업데이트 시 이전 chunk를 비활성화 가능 |
| `sourceId` | source 원본 연결 |
| `deliverableId` | deliverable 원본 연결 |
| `sessionId` | 원본 session 연결 |
| `templateType` | generation retrieval에서 boost/filter에 사용 |
| `sectionName` | deliverable section 단위 retrieval 결과 표시용 |
| `content` | retrieval 대상 원문 |
| `contentHash` | 중복 임베딩 방지 |
| `embedding` | 실제 벡터 |
| `embeddingModel` | 어떤 모델로 임베딩했는지 추적 |
| `embeddingVersion` | 재임베딩 버전 관리 |

### 2.3 왜 `contentHash`가 필요한가

이유:

1. 같은 내용 재임베딩 방지
2. source/deliverable 수정 여부 추적
3. embedding model은 같고 content가 동일할 때 재계산 불필요

권장 해시:

- SHA-256

### 2.4 왜 `embedding` dimension을 문서에서 고정하지 않나

현재 사용할 모델은 고정돼 있다.

- endpoint: `http://10.240.248.157:11434`
- model: `qwen3-embedding:4b`

하지만 문서 작성 시점에는 실제 vector dimension을 코드에 확정하지 않았다.

이유:

1. 잘못된 차원으로 migration을 만들면 이후 수정 비용이 크다
2. Ollama model metadata 또는 실제 호출 결과로 확인한 뒤 확정하는 편이 안전하다

따라서 구현 단계에서 해야 할 일:

1. `qwen3-embedding:4b`의 실제 dimension 확인
2. 그 값을 migration/schema에 고정
3. `.env.example`에는 선택적으로 `EMBEDDING_DIM`을 두되, source-of-truth는 실제 모델 차원으로 맞춘다

### 2.5 왜 `status`가 필요한가

`update` 대신 무조건 덮어쓰면:

- audit가 사라지고
- 동시성 이슈가 생기고
- 롤백이 어렵다

따라서 기본 전략은:

- 최신 chunk = `active`
- 이전 chunk = `superseded`

다만 첫 구현은 단순화를 위해 `upsert overwrite`도 가능하다. 이 문서는 `status`를 두는 쪽을 권장한다.

---

## 3. Drizzle / Migration 변경

### 3.1 새 타입 추가

`src/lib/db/schema.ts`에 추가:

```typescript
type MemoryChunkKind = 'deliverable_section' | 'source';
type MemoryChunkStatus = 'active' | 'superseded';
```

### 3.2 새 테이블 export

```typescript
export { memoryChunksTable, ...existingTables };
export type { MemoryChunkKind, MemoryChunkStatus, ...existingTypes };
```

### 3.3 migration

예상 migration 작업:

1. `create extension if not exists vector`
2. `create table memory_chunks`
3. btree index 생성
4. gin fts index 생성
5. vector index 생성

### 3.4 dimension을 하드코딩하지 않는 대안

문제:

- embedding model이 바뀌면 dimension도 바뀔 수 있다

선택지:

1. 초기에 dimension 고정
2. 모델 교체 시 migration

현재 단계에서는 **고정 dimension**이 맞다.

이유:

- 구현 단순
- retrieval index 관리 단순
- 아직 모델 실험 단계 아님

권장 env:

```env
EMBEDDING_MODEL=qwen3-embedding:4b
EMBEDDING_DIM=<actual_dimension_after_verification>
EMBEDDING_VERSION=1
```

---

## 4. 신규 환경변수

`.env.example`에 추가할 항목:

```env
EMBEDDING_API_URL=http://10.240.248.157:11434
EMBEDDING_MODEL=qwen3-embedding:4b
EMBEDDING_DIM=<actual_dimension_after_verification>
EMBEDDING_VERSION=1
```

설계 판단:

- chat/generation과 embedding endpoint를 분리할 수 있게 `EMBEDDING_API_URL` 분리
- 내부 인프라가 같아도 env는 분리한다
- embedding은 OpenAI-compatible `/v1`가 아니라 Ollama endpoint를 사용한다
- 따라서 `EMBEDDING_API_KEY`는 기본 전제에서 제외한다. 인증이 필요하면 실제 인프라 정책에 맞춰 별도 추가한다

---

## 5. 신규 서비스 계층

### 5.1 `src/lib/ai/embedding.ts`

역할:

- Ollama embedding client 생성
- 텍스트 배열을 벡터로 변환

예상 함수:

```typescript
async function embedTexts(texts: string[]): Promise<number[][]>
function getEmbeddingConfig(): {
  apiUrl: string;
  dimension: number | null;
  model: string;
  version: number;
}
```

구현 주의:

- 이 모듈은 `src/lib/ai/provider.ts`와 별개다.
- chat provider처럼 `createOpenAI`를 재사용하지 않는다.
- Ollama의 embedding endpoint shape에 맞는 request/response adapter가 필요하다.

### 5.2 `src/lib/memory/types.ts`

예상 타입:

```typescript
interface MemoryChunkInput {
  content: string;
  deliverableId?: string;
  kind: 'deliverable_section' | 'source';
  sectionName?: string;
  sessionId?: string;
  sourceId?: string;
  templateType?: TemplateType;
  workspaceId: string;
}

interface MemoryChunkSummary {
  content: string;
  deliverableId: string | null;
  id: string;
  kind: 'deliverable_section' | 'source';
  score: number;
  sectionName: string | null;
  sourceId: string | null;
  templateType: TemplateType | null;
}
```

### 5.3 `src/lib/memory/service.ts`

핵심 함수:

```typescript
async function upsertMemoryChunks(inputs: MemoryChunkInput[]): Promise<void>
async function replaceMemoryChunksForSource(sourceId: string): Promise<void>
async function replaceMemoryChunksForDeliverable(deliverableId: string): Promise<void>
```

이 문서 범위에서는 retrieval 함수보다 **ingest/upsert**가 핵심이다.

---

## 6. Ingest 규칙

### 6.1 Source ingest

트리거:

- `createSourceForSession`

현재:

1. source insert
2. session updatedAt 갱신

변경 후:

1. source insert
2. memory chunk 생성
3. embedding 생성
4. `memory_chunks` 저장
5. session updatedAt 갱신

### 6.2 Deliverable ingest

트리거:

- `updateDeliverableForWorkspace`

규칙:

- `draft`: 임베딩 안 함
- `final`: 임베딩
- `promoted_asset`: 임베딩 유지 또는 refresh

초기 단순 규칙:

```text
status가 final 또는 promoted_asset일 때만 replaceMemoryChunksForDeliverable 실행
```

### 6.3 Section 단위 저장

deliverable은 `sections[]`를 그대로 한 row로 묶지 않는다.

예:

```text
deliverable A
- section: 배경
- section: 현황 분석
- section: 시사점
- section: 제안
```

각 section이 별도 chunk가 된다.

이유:

- 검색 결과 품질이 좋아짐
- generation retrieval granularity가 자연스러움
- UI에서 "어느 section이 회수됐는지" 설명 가능

---

## 7. Chunking 규칙

### 7.1 Sources

초기 규칙:

- 1,200자 이하: 1 source = 1 chunk
- 초과: 문단 기준 분할

문단 분할이 불가능하면:

- 800~1,000자 단위 하드 스플릿

초기 버전에서는 overlap 없음.

이유:

- 단순성 우선
- source 대부분이 그렇게 길지 않을 가능성 높음

### 7.2 Deliverables

규칙:

- section 하나 = chunk 하나

추가 정규화:

- `section.name + content`를 함께 content로 넣을지 여부

권장:

- embedding 입력에는 `section.name + content`
- 저장 content는 그대로 `content`

이유:

- section semantics 강화

---

## 8. 중복과 재임베딩 처리

### 8.1 동일 content 처리

규칙:

- `contentHash + embeddingModel + embeddingVersion + kind + sourceId/deliverableId`
  기준으로 active row 중복 방지

### 8.2 source 수정 시

현재 source는 수정 API가 없지만, future-proof 기준으로 설계한다.

수정 시:

1. 기존 active chunk를 `superseded`
2. 새 content로 active chunk 생성

### 8.3 deliverable 수정 시

`updateDeliverableForWorkspace`에서:

- status만 바뀌면 내용 변경 없을 수 있음
- markdown/title 수정이면 내용 변경 있음

따라서:

- `final/promoted_asset` 상태에서 내용이 바뀐 경우에만 chunk replace
- 단순 status 승격이면 reuse 가능

단, 구현 단순화를 위해 초기 버전은 `final/promoted_asset` 저장마다 replace해도 된다.

---

## 9. 변경 파일별 스펙

### 9.1 `src/lib/db/schema.ts`

추가:

- `MemoryChunkKind`
- `MemoryChunkStatus`
- `memoryChunksTable`
- export

### 9.2 `drizzle/*`

추가:

- vector extension migration
- `memory_chunks` create migration

### 9.3 `.env.example`

추가:

- embedding env 4개

### 9.4 `src/lib/ai/embedding.ts`

신규:

- Ollama embedding client
- config getter
- batch embed 함수

### 9.5 `src/lib/memory/service.ts`

신규:

- chunk generation
- hashing
- upsert / replace

### 9.6 `src/lib/sessions/service.ts`

변경:

- `createSourceForSession` 후 memory ingest 호출

### 9.7 `src/lib/deliverables/service.ts`

변경:

- `updateDeliverableForWorkspace`에서 final/promoted_asset 상태에 memory ingest 호출

---

## 10. 이번 문서에서 의도적으로 안 하는 것

| 항목 | 이유 |
|------|------|
| hybrid retrieval 구현 | 다음 문서 `feature-hybrid-retrieval.md` 범위 |
| workspace search 교체 | retrieval 문서 범위 |
| generation prompt 변경 | retrieval 문서 범위 |
| message embedding | 후순위 |
| background job queue | 초기 구현은 동기 처리로 시작 가능 |

---

## 11. CLAUDE.md 체크리스트

- [ ] 신규 타입은 PascalCase 또는 명확한 literal union 사용
- [ ] 서비스 함수는 모듈 스코프 순수 함수로 분리
- [ ] `any` 사용 금지
- [ ] 원본 테이블 구조는 깨지지 않게 additive change만 수행
- [ ] migration은 destructive change 없이 추가만
- [ ] embedding config는 env 검증 함수로 감싸기
- [ ] `npm run harness:check` 통과
- [ ] `npm run build` 통과

---

## 12. 구현 순서

1. `schema.ts`에 `memoryChunksTable` 추가
2. migration 생성
3. `.env.example`에 embedding env 추가
4. `src/lib/ai/embedding.ts` 작성
5. `src/lib/memory/service.ts` 작성
6. `createSourceForSession`에 ingest 연결
7. `updateDeliverableForWorkspace`에 final/promoted_asset ingest 연결
8. 수동 backfill 없이 신규 데이터부터 쌓기
9. `harness:check` + `build`

---

## 13. Open Questions

다른 LLM과 논의할 질문:

1. `status`를 `active/superseded`로 둘지, 그냥 delete+insert로 갈지
2. `embedding` dimension을 env로 둘지, 코드 상수로 둘지
3. source chunking에서 paragraph split만으로 충분한지
4. deliverable section embedding 입력에 `sectionName` prefix를 넣을지
5. ingest를 동기로 시작해도 UX가 버틸지

추가 전제:

- chat/generation은 계속 기존 `/v1` endpoint
- embedding만 `http://10.240.248.157:11434`의 Ollama를 사용

---

## 14. 최종 판단

이번 단계의 핵심은 retrieval 품질이 아니라 **vector memory의 source-of-truth를 만드는 것**이다.

즉, 먼저 해야 할 것은:

- 임베딩 저장 구조 확립
- source/final deliverable의 안정적 축적

검색과 프롬프트 연결은 그 다음 단계다.
