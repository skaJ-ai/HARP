# DB Engineering: Current State and Vector Retrieval Proposal

> 목적: HARP의 현재 DB 구조, 검색/축적 방식, 그리고 향후 벡터 검색 도입 방향을 정리한다.
> 작성일: 2026-03-30
> 독자: 설계 LLM, 구현 LLM, 리뷰어
> 상태: 분석 + 제안 문서. 아직 구현 문서는 아님.

---

## 0. Executive Summary

짧게 결론부터 정리하면:

1. 현재 HARP에는 벡터 DB가 없다.
2. 현재 HARP 앱 코드에는 임베딩 연동이 없다.
3. 데이터는 이미 잘 쌓이고 있다.
4. 부족한 것은 "의미적으로 꺼내오는 retrieval 계층"이다.
5. 다음 단계는 별도 벡터 DB 신설보다 `PostgreSQL + pgvector` 확장이 맞다.

현재 구조는 아래와 같다.

- 저장: PostgreSQL + Drizzle ORM
- 검색: Postgres Full-Text Search (`to_tsvector`, `plainto_tsquery`, `ts_rank_cd`)
- 생성 참고: 최근 동일 유형 산출물 3건을 규칙 기반으로 참조
- LLM(chat/generation): 기존 OpenAI 호환 `/v1` endpoint 사용
- Embedding: 사내 Ollama endpoint가 따로 존재하지만 아직 앱과 미연동

즉, 지금 HARP는 "기록은 축적하는 시스템"이지 "semantic memory system"은 아니다.

---

## 1. Current Facts

### 1.1 현재 벡터 DB / 임베딩 사용 여부

현재 코드 기준으로:

- `pgvector` 사용 없음
- Pinecone, Weaviate, Milvus, Qdrant, Chroma 등 별도 벡터 DB 사용 없음
- embedding 관련 provider 없음
- embedding 관련 환경변수 없음
- 다만 사용할 내부 embedding 서버는 이미 정해져 있음:
  - `http://10.240.248.157:11434`
  - 모델: `qwen3-embedding:4b`
  - 사내 전용. 현재 chat LLM과 같은 trust boundary

현재 검색은 전부 Postgres FTS 기반이다.

```ts
const deliverableVector =
  sql`to_tsvector('simple', ${deliverablesTable.title} || ' ' || ${deliverablesTable.sections}::text)`;
const sourceVector = sql`to_tsvector('simple', ${sourcesTable.content})`;
const tsQuery = sql`plainto_tsquery('simple', ${normalizedQuery})`;
const deliverableRank = sql<number>`ts_rank_cd(${deliverableVector}, ${tsQuery})`;
const sourceRank = sql<number>`ts_rank_cd(${sourceVector}, ${tsQuery})`;
```

즉, 지금의 검색은 lexical search다. 의미 유사도 검색이 아니다.

### 1.2 현재 LLM 연결 방식

현재 AI provider는 chat/generation model 하나만 붙어 있다.

```ts
const provider = createOpenAI({
  apiKey: process.env.LLM_API_KEY ?? 'harp-local',
  baseURL: apiUrl,
  name: 'harp-qwen',
});

return provider(modelName);
```

환경변수도 generation/chat 모델 기준이다.

```env
LLM_API_URL=http://10.240.248.157:8533/v1
LLM_MODEL=Qwen/Qwen3-235B-A22B
```

여기에는 embedding endpoint, embedding model, dimension 설정이 없다.

반면 향후 붙일 embedding endpoint는 별도다.

```env
EMBEDDING_API_URL=http://10.240.248.157:11434
EMBEDDING_MODEL=qwen3-embedding:4b
```

중요:

- chat/generation은 기존처럼 OpenAI-compatible `/v1`를 유지한다.
- embedding만 별도 Ollama 서버를 쓴다.
- 따라서 embedding integration은 `createOpenAI` 재사용이 아니라 Ollama request/response shape를 처리하는 별도 adapter가 필요하다.
- embedding dimension은 아직 문서에서 고정값을 가정하지 않는다. 실제 `qwen3-embedding:4b` 차원을 확인한 뒤 schema에 확정해야 한다.

### 1.3 현재 DB 엔진과 ORM

현재 저장소는 PostgreSQL 단일 DB다.

- driver: `pg`
- ORM: `drizzle-orm`
- migration: `drizzle-kit`

관련 스크립트:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

앱 부트스트랩 시 migration도 자동 실행된다.

```ts
await migrate(database, { migrationsFolder: './drizzle' });
```

즉, 지금 구조는 "운영 DB = Postgres"가 매우 명확하다.

---

## 2. Current Data Model

현재 핵심 테이블은 6개다.

### 2.1 `users`

- 로그인 계정
- admin/user role

### 2.2 `workspaces`

- 한 사용자에게 하나 이상의 workspace
- 모든 세션/산출물의 상위 scope

### 2.3 `sessions`

- 하나의 작성 작업 단위
- `templateType`
- `checklist`
- `status`
- `updatedAt`

핵심 포인트:

- session은 인터뷰 단위다.
- template type별로 분리돼 있다.
- 나중에 retrieval filter에 아주 유용하다.

### 2.4 `messages`

- 세션 대화 기록
- `role`
- `content`
- `metadata`

assistant message에는 단순 텍스트만 있는 게 아니라:

- `canvas`
- `checklist`
- `uiMessageId`

같은 UI 메타데이터도 JSONB로 저장된다.

### 2.5 `sources`

- 사용자가 붙여넣거나 첨부한 근거자료
- `content`
- `label`
- `type`

이 테이블이 사실상 "1차 근거 메모리" 역할을 한다.

### 2.6 `deliverables`

- 생성된 산출물
- `sections` JSONB
- `status`
- `templateType`
- `version`

상태 라이프사이클:

- `draft`
- `final`
- `promoted_asset`

즉, HARP의 핵심 축적물은 결국 `sources + deliverables`다.

---

## 3. How Data Accumulates Today

현재 "축적"은 이미 구현돼 있다. 다만 retrieval이 semantic하지 않을 뿐이다.

### 3.1 세션 생성

세션 생성 시:

1. `sessions` row 생성
2. template별 초기 checklist 저장
3. starter assistant message 저장

즉, 세션은 빈 박스가 아니라 starter message를 포함한 상태로 시작한다.

### 3.2 자료 추가

사용자가 자료를 넣으면:

1. `sources`에 row insert
2. `sessions.updated_at` 갱신

자료는 현재 chunking이나 정규화 없이 원문 단위로 저장된다.

### 3.3 대화 진행

사용자 메시지와 assistant 메시지가 `messages`에 계속 쌓인다.

assistant 메시지 저장 시 함께 저장되는 것:

- 현재 checklist 상태
- canvas 상태
- UI message id

즉, 대화 로그는 단순 transcript가 아니라 "UI 상태 스냅샷 로그"까지 겸한다.

### 3.4 산출물 생성

산출물 생성 시 현재 프롬프트 컨텍스트는 다음으로 구성된다.

1. 현재 세션 대화
2. 현재 세션 근거자료
3. 최근 동일 유형 산출물 3건

그리고 결과는 `deliverables`에 저장된다.

이미 같은 session의 draft가 있으면 update하고, 아니면 새 draft를 insert한다.

즉, 지금도 축적은 잘 된다.

문제는 "과거 자산 중 무엇을 semantic하게 꺼내 쓸지"가 약하다는 점이다.

---

## 4. Current Retrieval Model

### 4.1 Workspace Search

현재 workspace search는 아래만 검색한다.

- `deliverables`
- `sources`

특징:

- `messages`는 검색 대상이 아님
- FTS 랭킹 기반
- workspace filter 있음
- snippet 생성 있음

좋은 점:

- 빠르다
- 구현 단순
- 운영 복잡도 낮음

한계:

- 단어가 안 맞으면 못 찾는다
- 비슷한 의미인데 다른 표현이면 놓친다
- "교육 만족도 하락 원인 분석"과 "교육 효과 저하 배경" 같은 의미 근접 문서 연결이 어렵다

### 4.2 Deliverable Reference

현재 생성 참고는 semantic retrieval이 아니라 recency-based retrieval이다.

기준:

- 같은 workspace
- 같은 template type
- 현재 session 제외
- 최근 3건

그리고 3-tier prompt formatting을 한다.

- 1건째: 전체 markdown
- 2건째: section summary
- 3건째: section name만

이건 좋은 intermediate step이다.

하지만 여전히 "가장 비슷한 과거 산출물"을 찾는 게 아니라 "가장 최근 산출물"을 가져오는 구조다.

---

## 5. Core Engineering Judgment

현재 HARP에 필요한 것은 새 저장소가 아니라 retrieval layer다.

정확히는:

- 저장 계층은 이미 충분하다.
- 검색 계층은 lexical 수준이다.
- semantic retrieval 계층만 추가하면 된다.

이 판단이 중요한 이유는 방향을 잘못 잡으면 아래처럼 되기 때문이다.

### 나쁜 방향

- Qdrant/Pinecone 같은 외부 벡터 DB를 먼저 붙임
- 운영 복잡도 증가
- 권한/필터/백업/동기화 이슈 증가
- 정작 현재 데이터 규모에 비해 과한 아키텍처

### 좋은 방향

- 기존 PostgreSQL 안에 vector layer 추가
- relational filter와 semantic retrieval을 같이 사용
- 기존 FTS도 유지
- 점진적 도입 가능

결론:

> 현재 단계에서 HARP는 "별도 벡터 DB"보다 "`Postgres + pgvector`"가 맞다.

---

## 6. Why `pgvector` Instead of Separate Vector DB

### 6.1 현재 구조와 맞는다

이미 모든 핵심 데이터가 Postgres 안에 있다.

- workspace ownership
- template type
- session linkage
- deliverable status/version

벡터 검색도 결국 이 metadata filter와 함께 써야 한다.

예:

- 같은 workspace만
- 같은 templateType 우선
- `final` 또는 `promoted_asset`만
- 현재 session 제외

이런 조건은 Postgres 안에서 같이 처리하는 게 훨씬 단순하다.

### 6.2 운영 복잡도가 낮다

별도 벡터 DB를 두면 추가로 필요한 것:

- 동기화 파이프라인
- 실패 재처리
- 삭제 전파
- 백업 전략 분리
- 권한 모델 분리
- 로컬/개발 환경 복잡화

지금 제품 단계에서는 이 복잡도가 가치보다 크다.

### 6.3 점진적 전환이 가능하다

`pgvector`를 쓰면:

1. 기존 FTS 유지
2. 일부 데이터만 vector indexing
3. hybrid search 도입
4. 필요 시 나중에 외부 vector DB로 분리

즉, 되돌리기 쉬운 선택이다.

---

## 7. Recommended Target Architecture

### 7.1 첫 단계의 목표

벡터 기반 retrieval의 첫 목표는 이것뿐이다.

1. 과거 `sources`를 semantic하게 찾는다.
2. 과거 `final/promoted_asset deliverables`를 semantic하게 찾는다.
3. 생성 시 recency-only 참조 대신 hybrid retrieval을 쓴다.

### 7.2 새 테이블 제안

별도 vector memory table 하나를 추가하는 방식을 권장한다.

```text
memory_chunks
```

예상 컬럼:

```text
id
workspace_id
kind                  -- 'source' | 'deliverable_section'
source_id             -- nullable
deliverable_id        -- nullable
session_id            -- nullable
template_type         -- nullable
section_name          -- nullable
content
content_hash
embedding
embedding_model
embedding_version
created_at
updated_at
```

이유:

- 원본 테이블을 더럽히지 않는다
- sources/deliverables를 같은 retrieval plane에 올릴 수 있다
- re-embedding/versioning 관리가 쉽다

### 7.3 왜 원본 테이블에 vector 컬럼을 직접 안 넣나

가능은 하지만 초기에 권하지 않는다.

이유:

1. `deliverables.sections`는 JSONB라 section 단위 retrieval이 어렵다
2. `sources`는 앞으로 chunking이 필요해질 가능성이 높다
3. memory 단위를 별도로 관리하는 것이 재임베딩에 유리하다

즉, retrieval unit과 source-of-truth row는 분리하는 게 좋다.

---

## 8. What Should Be Embedded

### 8.1 Phase 1: embed 대상

처음엔 아래만 임베딩한다.

1. `sources.content`
2. `deliverables.sections[].content` 단위

### 8.2 Phase 1: embed 제외 대상

처음엔 아래는 제외한다.

1. `messages.content`
2. `draft deliverables`

### 8.3 왜 `messages`는 처음에 빼나

이유:

- 대화 잡음이 많다
- UI 지시/확인 텍스트가 섞여 있다
- 이미 대화 핵심은 산출물과 sources에 흡수된다
- retrieval quality보다 noise risk가 더 크다

`messages`는 later-phase memory로 보는 게 맞다.

### 8.4 왜 `draft`는 처음에 빼나

`draft`는 아직 품질이 안정되지 않았다.

semantic retrieval에 넣으면:

- 부정확한 문장이 과거 레퍼런스로 회수될 수 있고
- low-confidence 내용이 memory contamination을 만든다

그래서 첫 단계는:

- `sources`: 즉시 임베딩 가능
- `deliverables`: `final` 또는 `promoted_asset`만 임베딩

이게 가장 안전하다.

---

## 9. Chunking Strategy

### 9.1 `sources`

초기에는 과도한 chunking보다 단순 전략이 좋다.

권장:

- 짧은 source는 1 row = 1 chunk
- 긴 source만 문단/문장 기준으로 분할

실무 기준 제안:

- 1,000~1,500자 이하: 그대로 1 chunk
- 그 이상: 문단 기준 분할
- overlap은 초기에 생략 가능

### 9.2 `deliverables`

deliverable은 section 단위 chunking이 적절하다.

이유:

- 이미 section 구조가 있다
- retrieval granularity가 명확하다
- citation/confidence와 연결 가능하다

예:

- 배경
- 현황 분석
- 시사점
- 제안

각 section이 하나의 retrieval unit이 된다.

---

## 10. Retrieval Strategy

### 10.1 Hybrid Search를 기본으로

벡터 검색이 들어와도 FTS를 버리면 안 된다.

권장 방식:

- FTS score
- vector similarity
- template type match boost
- recency boost

를 혼합한다.

즉:

```text
final_score =
  lexical_score
  + semantic_score
  + template_match_bonus
  + recency_bonus
```

### 10.2 왜 hybrid가 맞나

FTS가 강한 경우:

- 고유명사
- 숫자/정책명/지표명
- 정확한 용어 검색

vector가 강한 경우:

- 의미는 같은데 표현이 다른 경우
- 유사한 사례 찾기
- 요약형 문장 매칭

둘을 같이 써야 품질이 안정된다.

### 10.3 generation retrieval과 workspace search는 분리

두 retrieval use case는 같지 않다.

#### A. Workspace Search

목적:

- 사용자가 자료/산출물을 찾는 것

중요 요소:

- lexical precision
- 빠른 응답
- stable sorting

#### B. Generation Retrieval

목적:

- 생성 프롬프트에 넣을 참고 문맥 찾기

중요 요소:

- semantic relevance
- template affinity
- 품질 좋은 결과만 포함

즉, search pipeline과 generation pipeline은 같은 memory table을 보더라도 ranking logic을 다르게 가져가야 한다.

---

## 11. Ingestion Flow Proposal

### 11.1 Source ingest

현재:

- source row insert만 함

제안:

1. `sources` insert
2. chunk 생성
3. chunk별 embedding 생성
4. `memory_chunks` upsert

### 11.2 Deliverable ingest

현재:

- `deliverables` insert/update만 함

제안:

1. draft 저장은 기존대로
2. `final` 또는 `promoted_asset`로 바뀔 때
3. section별 chunk 생성
4. embedding 생성
5. `memory_chunks` upsert

### 11.3 Upsert 기준

권장:

- `content_hash`
- `embedding_model`
- `embedding_version`

기준으로 중복 임베딩 방지

이렇게 해야:

- 같은 내용 재임베딩 방지
- 모델 변경 시 selective re-embedding 가능

---

## 12. Phased Rollout Plan

### Phase 0. 지금 유지

목표:

- 현재 FTS + 최근 3건 참고 구조 유지

아직 해야 할 것:

- 없음

### Phase 1. Vector memory layer 추가

목표:

- `memory_chunks` 테이블 생성
- source/final deliverable 임베딩 저장

범위:

- schema
- embedding client
- background ingest or sync ingest
- backfill script

### Phase 2. Workspace Search hybrid화

목표:

- 기존 `searchWorkspaceContent`를 hybrid search로 확장

범위:

- semantic top-k
- lexical + semantic fusion
- ranking calibration

### Phase 3. Generation retrieval hybrid화

목표:

- `generateDeliverableForSession`에서 recency-only가 아니라 semantic retrieval도 사용

추천 방식:

- 현재의 "최근 3건" tier는 유지
- semantic top-k를 별도 블록으로 추가

즉, recency context와 semantic context를 섞되 구분해서 넣는다.

### Phase 4. Optional memory expansion

후순위:

- message embedding
- user feedback signal
- section confidence 기반 retrieval filtering

---

## 13. Operational Risks

### 13.1 Memory contamination

위험:

- 품질 낮은 draft가 memory에 들어가는 것

대응:

- draft 제외
- final/promoted_asset만 임베딩

### 13.2 Re-embedding cost

위험:

- 모델 교체 시 전체 재임베딩 비용

대응:

- `embedding_model`, `embedding_version` 저장
- 백필 작업 분리

### 13.3 Retrieval drift

위험:

- semantic retrieval이 lexical precision을 해칠 수 있음

대응:

- hybrid search 유지
- template/workspace filter 강제

### 13.4 Over-engineering

위험:

- 외부 vector DB까지 한 번에 도입

대응:

- Postgres 내 점진 도입

---

## 14. Open Questions

다른 LLM과 논의할 때 봐야 할 핵심 질문은 이 정도다.

### Q1. `memory_chunks` 단일 테이블이 맞나?

대안:

- `source_chunks`
- `deliverable_section_chunks`

분리 테이블로 갈 수도 있다.

내 판단:

- 지금은 단일 테이블이 더 낫다.
- retrieval plane을 하나로 보는 편이 단순하다.

### Q2. `messages`를 임베딩 대상에 넣을 가치가 있나?

내 판단:

- 지금은 아니다.
- 추후 사용자 질문 로그에서 반복 패턴을 학습하고 싶을 때 검토 가능

### Q3. generation retrieval에서 semantic top-k를 몇 개까지 넣을까?

내 판단:

- 처음엔 3~5 chunk면 충분하다.
- 지금도 최근 3건이 들어가므로, semantic도 과도하면 prompt가 무거워진다.

### Q4. embedding은 동기 저장인가, 비동기 저장인가?

내 판단:

- source는 초기엔 동기 저장도 가능
- deliverable finalization은 비동기 큐가 더 자연스럽다
- 다만 현재 시스템 복잡도를 생각하면 처음엔 동기로 시작해도 된다

### Q5. separate vector DB로 갈 명확한 기준은?

내 판단:

아래 중 둘 이상 충족되면 검토:

- memory chunk 수가 크게 증가
- retrieval latency가 Postgres에서 감당 안 됨
- multi-tenant isolation 요구가 복잡해짐
- vector search workload가 main OLTP workload를 침범함

지금은 아직 아니다.

---

## 15. Recommended Next Step

구현 관점에서 다음 한 걸음은 이 문서의 전부가 아니다.

가장 현실적인 다음 액션은:

1. `pgvector` 도입 여부 확정
2. `memory_chunks` 스키마 초안 작성
3. embedding provider env 설계
   - 단, `LLM_API_URL`과 별개로 `EMBEDDING_API_URL=http://10.240.248.157:11434` 전제
   - embedding provider는 Ollama 전용 adapter로 설계
4. source/final deliverable ingest 설계 문서 분리

즉, 다음 구현 문서는 아래 둘로 쪼개는 게 좋다.

- `feature-vector-memory-schema.md`
- `feature-hybrid-retrieval.md`

---

## 16. Final Position

현재 HARP는:

- 데이터 저장은 이미 잘하고 있고
- 작업 이력도 충분히 축적하고 있으며
- 검색과 프롬프트 컨텍스트도 최소 수준은 갖췄다

하지만 아직:

- 의미 기반 검색
- 유사 사례 retrieval
- semantic memory

는 없다.

그래서 지금 필요한 것은 "새로운 DB"가 아니라:

> 기존 PostgreSQL 위에 vector memory layer를 얹는 것

이 방향이 현재 코드 구조, 운영 복잡도, 제품 단계에 가장 잘 맞는다.
