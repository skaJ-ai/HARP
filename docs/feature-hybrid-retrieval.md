# Feature Design: Hybrid Retrieval

> **문서 목적**: 구현 LLM이 HARP에 hybrid retrieval을 추가하기 위한 검색/랭킹/프롬프트 설계 문서.
> **작성일**: 2026-03-30
> **상위 문서**: `docs/db_engineering.md`, `docs/feature-vector-memory-schema.md`
> **선행 조건**: `memory_chunks` 테이블과 embedding ingest가 먼저 구현되어 있어야 함

중요 전제:

- chat/generation LLM은 기존 OpenAI-compatible `/v1` endpoint를 유지한다.
- query embedding과 memory ingest embedding만 별도 internal Ollama endpoint를 사용한다.
- embedding endpoint: `http://10.240.248.157:11434`
- embedding model: `qwen3-embedding:4b`

---

## 0. 현재 상태 분석

현재 검색은 두 군데다.

### 0.1 Workspace Search

현재 `searchWorkspaceContent`는:

- `deliverables`
- `sources`

를 각각 FTS로 검색한 뒤 합쳐서 정렬한다.

```typescript
const deliverableVector = sql`to_tsvector('simple', ...)`;
const sourceVector = sql`to_tsvector('simple', ...)`;
const tsQuery = sql`plainto_tsquery('simple', ${normalizedQuery})`;
const deliverableRank = sql<number>`ts_rank_cd(${deliverableVector}, ${tsQuery})`;
const sourceRank = sql<number>`ts_rank_cd(${sourceVector}, ${tsQuery})`;
```

장점:

- 빠름
- 예측 가능
- 간단함

한계:

- 의미가 비슷하지만 표현이 다르면 잘 못 찾음
- query reformulation이 없음
- 유사 사례 탐색에 약함

### 0.2 Generation Retrieval

현재 `generateDeliverableForSession`은 semantic retrieval 없이:

- 같은 workspace
- 같은 template type
- 최근 산출물 3건

만 참조한다.

즉, retrieval 기준이 relevance가 아니라 recency다.

---

## 1. 핵심 설계 결정

### 1.1 검색은 hybrid로 간다

이번 단계에서 벡터 검색이 추가돼도 FTS를 버리지 않는다.

이유:

- FTS는 정확한 용어, 정책명, 수치 키워드에 강하다
- vector는 의미 근접 문서를 찾는 데 강하다

따라서 기본 원칙:

> lexical search와 semantic search를 둘 다 계산하고, 점수 결합으로 최종 순위를 만든다.

### 1.2 use case를 분리한다

hybrid retrieval은 두 종류로 나뉜다.

#### A. Workspace Search

목적:

- 사용자가 원하는 자료/산출물을 찾기

우선순위:

- lexical precision 높음
- 검색 결과 설명 가능성 높음
- 안정적인 정렬

#### B. Generation Retrieval

목적:

- LLM 생성 프롬프트에 넣을 문맥 찾기

우선순위:

- semantic relevance 높음
- template affinity 중요
- 품질 낮은 문서 제외 필요

즉, 같은 memory table을 보더라도 ranking weight는 달라야 한다.

---

## 2. Retrieval Source

검색 대상은 `memory_chunks` 하나로 통합한다.

kind:

- `source`
- `deliverable_section`

하지만 use case별 필터는 다르다.

### 2.1 Workspace Search 필터

- `workspaceId = currentWorkspaceId`
- `status = active`

추가로 kind는 둘 다 포함한다.

### 2.2 Generation Retrieval 필터

- `workspaceId = currentWorkspaceId`
- `status = active`
- `sessionId != currentSessionId` 가능하면 우선 적용

권장 추가 규칙:

- `templateType = currentTemplateType` 우선
- `kind = deliverable_section` 가중치 우선
- source는 보조 문맥으로 사용

---

## 3. Query Pipeline

### 3.1 Workspace Search pipeline

입력:

- user query
- workspaceId

절차:

1. query embedding 생성
2. lexical top-k 조회
3. semantic top-k 조회
4. dedupe
5. fusion ranking
6. snippet/title/href로 result materialize

### 3.2 Generation Retrieval pipeline

입력:

- session title
- current conversation transcript
- current sources
- templateType
- workspaceId

질문:

무엇을 query text로 임베딩할 것인가?

권장:

```text
session title + latest user goals + current source summaries
```

초기 구현에서는 단순화:

```text
sessionTitle + 최근 user message 1~3개
```

절차:

1. generation retrieval query text 구성
2. query embedding 생성
3. semantic top-k memory chunk 조회
4. 같은 templateType boost 적용
5. recency top-3 deliverable tier는 기존대로 유지
6. semantic context block을 추가로 프롬프트에 삽입

즉, 기존 context tiering을 버리는 게 아니라 semantic block을 추가한다.

query embedding 구현 주의:

- 여기서의 query embedding은 `feature-vector-memory-schema.md`에서 정의한 Ollama embedding client를 사용한다.
- 현재 chat provider의 `/v1` client를 재사용하지 않는다.

---

## 4. Ranking Formula

### 4.1 Workspace Search

권장 score:

```text
final_score =
  0.55 * lexical_score
  + 0.35 * semantic_score
  + 0.05 * recency_score
  + 0.05 * template_match_bonus
```

해석:

- workspace search는 lexical precision이 더 중요
- semantic은 보조

### 4.2 Generation Retrieval

권장 score:

```text
final_score =
  0.25 * lexical_score
  + 0.55 * semantic_score
  + 0.15 * template_match_bonus
  + 0.05 * recency_score
```

해석:

- generation retrieval은 semantic relevance가 더 중요
- 같은 templateType은 강하게 밀어줌

### 4.3 점수 정규화

주의:

- FTS score와 vector similarity score는 scale이 다르다

따라서 단순 합산 전에 0~1 범위 정규화가 필요하다.

권장:

- lexical: query 결과 내 max-min normalization
- semantic: cosine similarity를 0~1로 재매핑

---

## 5. 구현 구조

### 5.1 `src/lib/memory/retrieval.ts`

신규 파일 권장.

핵심 함수:

```typescript
interface HybridRetrievalResult {
  content: string;
  deliverableId: string | null;
  kind: 'deliverable_section' | 'source';
  lexicalScore: number;
  score: number;
  sectionName: string | null;
  semanticScore: number;
  sourceId: string | null;
  templateType: TemplateType | null;
}

async function searchMemoryChunksHybrid(params: {
  limit: number;
  mode: 'generation' | 'workspace';
  query: string;
  templateType?: TemplateType;
  workspaceId: string;
}): Promise<HybridRetrievalResult[]>
```

보조 함수:

```typescript
function normalizeScores(...)
function computeHybridScore(...)
function buildMemorySearchTsQuery(...)
```

### 5.2 `src/lib/search/service.ts`

현재 `deliverablesTable` / `sourcesTable` 직접 조회를 대체 또는 보조한다.

권장 방식:

- 기존 코드 유지
- 새로운 hybrid search 경로 추가
- 안정화 후 완전 교체

즉, 첫 구현은:

```typescript
async function searchWorkspaceContent(...) {
  return searchWorkspaceContentHybrid(...);
}
```

로 한 번에 바꾸기보다,

```typescript
async function searchWorkspaceContent(...)
async function searchWorkspaceContentHybrid(...)
```

두 함수를 병행하는 게 안전하다.

### 5.3 `src/lib/deliverables/service.ts`

변경 포인트:

- `buildGenerationPromptContext`
- `generateDeliverableForSession`

현재는:

- current session conversation
- current sources
- recent deliverables 3

만 들어간다.

변경 후:

- current session conversation
- current sources
- recent deliverables 3
- semantic memory top-k

로 확장한다.

---

## 6. Prompt Integration

### 6.1 현재 프롬프트 구조

현재 생성 프롬프트는 대략:

```text
[문서 제목]
[현재 세션 대화 기록]
[현재 세션 근거자료]
[이전 동일 유형 산출물 — 최근 3건]
[작성 요청]
```

### 6.2 변경 후 구조

```text
[문서 제목]

[현재 세션 대화 기록]
...

[현재 세션 근거자료]
...

[이전 동일 유형 산출물 — 최근 3건, 상세→구조 순]
...

[의미 기반 참고 자산]
- ...
- ...
- ...

[작성 요청]
...
```

핵심:

- 기존 recent 3건 블록은 유지
- semantic block을 별도로 추가
- 둘을 섞어 쓰지 않는다

이유:

- LLM이 "최근 유사 문서"와 "의미상 관련 자산"을 구분해서 해석할 수 있게 하기 위함

### 6.3 semantic block 포맷

권장:

```text
[의미 기반 참고 자산]
- [deliverable_section | 교육 결과 보고서 | 시사점 | score=0.82]
  현업 적용률은 전년 대비 ...

- [source | 교육 만족도 설문 | score=0.79]
  교육 종료 직후 만족도 평균은 ...
```

너무 긴 본문은 잘라야 한다.

권장 상수:

```typescript
const SEMANTIC_REFERENCE_LIMIT = 4;
const SEMANTIC_REFERENCE_MAX_LENGTH = 320;
```

---

## 7. Workspace Search UI 영향

현재 UI는 `WorkspaceSearchResult[]`를 기대한다.

따라서 hybrid retrieval 결과는 기존 UI shape로 materialize해야 한다.

즉, retrieval 내부는 바뀌어도 반환 타입은 크게 바꾸지 않는다.

필수 필드:

- `id`
- `kind`
- `title`
- `snippet`
- `href`
- `updatedAt`
- `rank`

추가 가능 필드:

- `matchType: 'lexical' | 'semantic' | 'hybrid'`

초기에는 UI 변경 없이 가는 게 맞다.

---

## 8. Deduping Rules

hybrid retrieval은 lexical top-k와 semantic top-k가 겹칠 수 있다.

dedupe key:

- `memory_chunk.id` 우선

workspace search 최종 결과 materialize 단계에서는:

- 같은 `deliverableId + sectionName`은 하나로
- 같은 `sourceId`는 하나로

정리하는 것이 좋다.

이유:

- 같은 deliverable에서 section 3개가 연속으로 떠버리면 UX가 나빠진다

generation retrieval은 반대로 section 여러 개가 들어가는 것이 유용할 수 있으므로 dedupe 기준을 더 느슨하게 가져갈 수 있다.

---

## 9. 품질 보호 규칙

### 9.1 generation retrieval

아래는 제외 권장:

- semantic score가 낮은 chunk
- 너무 짧은 chunk
- template mismatch인데 relevance도 낮은 chunk

권장 최소 규칙:

```text
top-k에서 score threshold 미만 제거
```

### 9.2 workspace search

workspace search는 threshold를 너무 높이면 결과가 빈약해질 수 있다.

따라서:

- lexical 결과 우선 유지
- semantic은 보강 역할

이 맞다.

---

## 10. 변경 파일별 스펙

### 10.1 `src/lib/memory/retrieval.ts`

신규:

- lexical+semantic query
- normalization
- ranking
- dedupe

### 10.2 `src/lib/search/service.ts`

변경:

- FTS only -> hybrid search path 추가

### 10.3 `src/lib/deliverables/service.ts`

변경:

- `generateDeliverableForSession`에서 semantic retrieval 호출
- `buildGenerationPromptContext`에 semantic block 추가

### 10.4 `src/lib/memory/types.ts`

추가:

- retrieval result 타입

---

## 11. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| `sessions/service.ts` 세션 저장 로직 | retrieval 레이어 범위 아님 |
| `messages` 기반 search | 초기 범위 아님 |
| 랜딩/워크스페이스 UI 구조 | 검색 결과 shape 유지로 영향 최소화 |
| recent 3건 context tiering 제거 | semantic retrieval과 병행해야 안정적 |

---

## 12. CLAUDE.md 체크리스트

- [ ] ranking 함수는 모듈 스코프 순수 함수로 분리
- [ ] `any` 사용 금지
- [ ] magic number는 상수로 추출
- [ ] 기존 `WorkspaceSearchResult` 반환 shape 최대한 유지
- [ ] generation prompt 블록은 기존 구조를 깨지 않게 additive change로만
- [ ] `npm run harness:check` 통과
- [ ] `npm run build` 통과

---

## 13. 구현 순서

1. `memory/retrieval.ts` 신규 작성
2. lexical/semantic normalization 함수 작성
3. hybrid score 함수 작성
4. workspace hybrid search 함수 작성
5. `searchWorkspaceContent`에 연결
6. generation retrieval query builder 작성
7. `generateDeliverableForSession`에 semantic retrieval 연결
8. `buildGenerationPromptContext`에 semantic block 추가
9. `harness:check` + `build`

---

## 14. Open Questions

다른 LLM과 논의할 질문:

1. workspace search에서 lexical 비중을 0.55보다 더 높여야 하는가
2. generation retrieval에서 source와 deliverable_section의 가중치를 다르게 줄 것인가
3. semantic reference top-k를 4로 둘지 3 또는 5로 둘지
4. dedupe를 deliverable 단위로 강하게 할지, section 단위 노출을 허용할지
5. semantic query text를 `sessionTitle + recent user messages`로 충분히 볼 수 있는지

---

## 15. 최종 판단

hybrid retrieval의 핵심은 벡터 검색을 넣는 것이 아니라:

1. 기존 FTS를 버리지 않고
2. semantic relevance를 추가하고
3. use case별 ranking 목적을 분리하는 것

이다.

즉, 이번 단계의 성공 조건은 "벡터가 된다"가 아니라:

> workspace search와 generation retrieval이 각각 더 관련도 높은 결과를 안정적으로 돌려주는 것

이다.
