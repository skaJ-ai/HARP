# Feature Design: Source Enrichment

> **문서 목적**: 구현 LLM이 HARP에서 "사용자는 raw 자료만 넣고, 시스템이 나중에 구조화한다"는 원칙을 구현하기 위한 설계 문서.
> **작성일**: 2026-03-30
> **상위 문서**: `docs/product-borrowing-from-pllm.md`, `docs/db_engineering.md`
> **변경 파일 예상 범위**: 4개 이상 (schema, sessions service, enrichment service, worker/cron entry)

---

## 0. 현재 상태 분석

현재 source 처리 흐름은 아래와 같다.

1. 사용자가 자료를 붙인다.
2. `createSourceForSession`이 `sources` row를 저장한다.
3. `sessions.updatedAt`만 갱신한다.

즉, 지금은:

- raw source 저장은 된다
- 검색도 raw text 기반으로 된다
- prompt에도 raw text를 잘라 넣는다

하지만 아직 아래는 없다.

- source 요약
- source 태그
- 핵심 사실 추출
- 체크리스트 항목과의 연결
- source 품질 상태

이 말은 곧, **사용자는 자료를 넣은 뒤에도 실질적으로는 사람이 다시 읽고 해석해야 한다**는 뜻이다.

---

## 1. 핵심 설계 결정

### 1.1 즉시 사용 가능 + 나중 정제

이 feature의 핵심은 두 단계다.

#### 즉시 경로

사용자가 source를 넣는 순간:

- source는 즉시 저장된다
- 현재 세션에서 바로 검색 가능하다
- 현재 초안 작성에도 바로 참고 가능하다

즉, 사용자 experience는 느려지면 안 된다.

#### 지연 경로

이후 유휴시간 또는 야간에:

- 요약 생성
- 태그 생성
- 핵심 사실 추출
- 체크리스트 연결
- 벡터 메모리용 고품질 텍스트 재구성

을 실행한다.

즉, **즉시 가치와 구조화 비용을 분리**한다.

### 1.2 source enrichment는 원본을 덮어쓰지 않는다

중요 원칙:

- `sources.content`는 source-of-truth
- enrichment는 별도 테이블/레이어에 저장

이유:

1. 원문 보존
2. 재생성 가능
3. 모델 교체 시 다시 생성 가능

### 1.3 사용자가 느끼는 가치는 "정리됨"이어야 한다

사용자가 보게 될 변화는 아래다.

- 자료가 "정리 중"인지 보임
- 정리되면 한 줄 요약과 태그가 보임
- HARP가 어떤 체크리스트 항목과 연결했는지 보임

즉, enrichment는 백엔드 최적화가 아니라 UX 가치여야 한다.

---

## 2. 신규 데이터 모델

### 2.1 `source_enrichments` 테이블

```typescript
type SourceEnrichmentStatus = 'failed' | 'pending' | 'ready';
```

```typescript
const sourceEnrichmentsTable = pgTable(
  'source_enrichments',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    sourceId: uuid('source_id')
      .notNull()
      .references(() => sourcesTable.id, { onDelete: 'cascade' })
      .unique(),

    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),

    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),

    templateType: text('template_type').$type<TemplateType>().notNull(),

    status: text('status').$type<SourceEnrichmentStatus>().default('pending').notNull(),

    shortSummary: text('short_summary'),
    detailedSummary: text('detailed_summary'),
    tags: jsonb('tags').$type<string[]>().default([]).notNull(),
    extractedFacts: jsonb('extracted_facts')
      .$type<Array<{ label: string; value: string }>>()
      .default([])
      .notNull(),
    suggestedChecklistIds: jsonb('suggested_checklist_ids').$type<string[]>().default([]).notNull(),

    contentHash: text('content_hash').notNull(),
    model: text('model'),
    version: integer('version').default(1).notNull(),
    lastError: text('last_error'),
    enrichedAt: timestamp('enriched_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    workspaceIndex: index('idx_source_enrichments_workspace_id').on(table.workspaceId),
    sessionIndex: index('idx_source_enrichments_session_id').on(table.sessionId),
    statusIndex: index('idx_source_enrichments_status').on(table.status),
  }),
);
```

### 2.2 왜 별도 job 테이블 대신 status 기반으로 시작하나

가능한 대안:

- `enrichment_jobs` generic queue

하지만 첫 구현에선 과하다.

초기에는:

- `source_enrichments.status = pending`

만으로도 충분하다.

worker는 아래만 보면 된다.

- `status = pending`
- 또는 `contentHash` 변경으로 stale 상태

즉, **queue를 일반화하지 않고 단일 feature용 상태 테이블로 시작**한다.

---

## 3. Enrichment 내용

### 3.1 short summary

목적:

- source 리스트에서 바로 읽히는 한 줄 요약

제약:

- 120자 내외

### 3.2 detailed summary

목적:

- prompt context나 source detail panel에서 쓰는 중간 길이 요약

제약:

- 300~500자 내외

### 3.3 tags

예:

- `교육 만족도`
- `현업 적용도`
- `수료율`
- `비용`
- `제도 비교`

용도:

- 검색 보조
- UI badge
- retrieval filtering의 미래 재료

### 3.4 extracted facts

예:

```json
[
  { "label": "만족도", "value": "4.6/5" },
  { "label": "수료율", "value": "92%" }
]
```

용도:

- quick scan
- 차후 차트/테이블 생성의 기초

### 3.5 suggested checklist ids

목적:

- 이 source가 어떤 체크리스트 항목에 가장 관련 있는지 제안

예:

- `current_state`
- `evidence`
- `proposal`

주의:

- 자동 체크는 하지 않는다
- suggestion만 제공한다

---

## 4. 서비스 구조

### 4.1 신규 파일: `src/lib/enrichment/source.ts`

핵심 함수:

```typescript
async function enqueueSourceEnrichment(params: {
  content: string;
  sessionId: string;
  sourceId: string;
  templateType: TemplateType;
  workspaceId: string;
}): Promise<void>

async function runPendingSourceEnrichmentBatch(limit: number): Promise<number>

async function enrichSource(params: {
  content: string;
  sourceId: string;
  templateType: TemplateType;
}): Promise<{
  detailedSummary: string;
  extractedFacts: Array<{ label: string; value: string }>;
  shortSummary: string;
  suggestedChecklistIds: string[];
  tags: string[];
}>
```

### 4.2 `createSourceForSession` 연결

현재:

1. source insert
2. session updatedAt 갱신

변경 후:

1. source insert
2. `source_enrichments` pending row upsert
3. session updatedAt 갱신

즉, 사용자 latency에는 enrichment를 동기 수행하지 않는다.

### 4.3 worker/cron entry

후보:

- `src/app/api/internal/enrichment/source/route.ts`
- 또는 `src/lib/enrichment/runner.ts`

첫 구현에서는 internal route가 가장 단순하다.

입력:

- `POST /api/internal/enrichment/source?limit=20`

동작:

- pending row들을 읽어 batch 실행
- 성공 시 `ready`
- 실패 시 `failed`, `lastError` 기록

---

## 5. UI 영향

### 5.1 Session source list

현재 source는:

- label
- type
- createdAt

정도만 보인다.

추가:

- `정리 중` badge
- `정리 완료` badge
- short summary
- tags

### 5.2 Prompt context

초기에는 raw source를 그대로 유지해도 되지만, 다음 단계에선 아래 우선순위로 바꾸는 것이 좋다.

1. `detailedSummary`
2. 핵심 사실
3. 필요 시 raw source 일부

즉, enrichment가 쌓일수록 prompt token 효율도 좋아진다.

### 5.3 Vector memory와의 연결

`docs/feature-vector-memory-schema.md`와 연결 시:

- 초기 임베딩: raw source 기준
- enrichment 완료 후: summary/tag/fact 기반으로 memory chunk refresh 가능

이때 enrichment는 retrieval 품질을 끌어올리는 전처리로 기능한다.

---

## 6. 변경 파일별 스펙

### 6.1 `src/lib/db/schema.ts`

추가:

- `SourceEnrichmentStatus`
- `sourceEnrichmentsTable`

### 6.2 `src/lib/sessions/service.ts`

변경:

- `createSourceForSession`에서 pending enrichment row 생성

### 6.3 `src/lib/enrichment/source.ts`

신규:

- content hash 계산
- enrichment prompt builder
- batch runner

### 6.4 `.env.example`

추가 가능:

```env
ENRICHMENT_MODEL=Qwen/Qwen3-32B
ENRICHMENT_VERSION=1
```

chat model과 분리할지 여부는 open question으로 둔다.

---

## 7. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| `sources` 원문 저장 방식 | 원본은 그대로 source-of-truth로 유지 |
| source 업로드 UX | 사용자는 여전히 그냥 자료를 넣기만 함 |
| OCR/파일 파싱 | 이번 범위 아님 |
| 차트 렌더링 | 이번 범위 아님 |
| 자동 checklist 체크 | suggestion만 제공, auto-complete는 하지 않음 |

---

## 8. CLAUDE.md 체크리스트

- [ ] schema 변경은 additive only
- [ ] 서비스 함수는 모듈 스코프 순수 함수로 분리
- [ ] `any` 사용 금지
- [ ] pending/ready/failed 상태 전이 명확히 처리
- [ ] source 저장 성공이 enrichment 실패에 의해 롤백되지 않도록 분리
- [ ] `npm run harness:check` 통과
- [ ] `npm run build` 통과

---

## 9. 구현 순서

1. `sourceEnrichmentsTable` schema 추가
2. migration 생성
3. `enqueueSourceEnrichment` 구현
4. `createSourceForSession`에 pending row 연결
5. `enrichSource` prompt/파서 구현
6. `runPendingSourceEnrichmentBatch` 구현
7. source list UI에 status/summary/tag 표시
8. `harness:check` + `build`

---

## 10. Open Questions

1. enrichment를 완전 야간 배치로만 할지, 유휴시간 즉시 처리도 허용할지
2. `suggestedChecklistIds`를 얼마나 공격적으로 제안할지
3. summary를 source UI에 얼마나 드러낼지
4. enrichment 완료 후 memory chunk를 즉시 refresh할지, 별도 배치로 넘길지

---

## 11. 최종 판단

이 feature의 핵심은 "AI가 source를 더 똑똑하게 읽는다"가 아니다.

핵심은:

> 사용자는 raw 자료만 던지고, HARP는 그 자료를 나중에 스스로 구조화해 다음 작업에 더 잘 쓰이게 만드는 것

이다.
