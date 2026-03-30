# Product Borrowing from pLLM

> **문서 목적**: pLLM 문서에서 HARP에 실제로 차용할 수 있는 제품 원칙을 정리하고, 이를 구현 가능한 feature 설계 문서로 분해한다.
> **작성일**: 2026-03-30
> **출처 맥락**: pLLM(Project Lifecycle Management powered by LLM) 제품 개념 메모
> **결론 요약**: HARP는 pLLM의 **철학과 루프**를 차용할 수 있지만, **인프라와 저장소 선택**은 그대로 가져오면 안 된다.

---

## 0. Executive Summary

pLLM에서 HARP에 가장 잘 맞는 요소는 아래 다섯 가지다.

1. **사용자는 구조화하지 않는다**
2. **즉시 가치가 먼저, 정제는 나중에**
3. **지식은 조용히 축적된다**
4. **요약은 계층적으로 압축된다**
5. **AI는 요청만 기다리지 않고 먼저 안내한다**

반대로 그대로 가져오면 안 되는 것은 아래다.

1. `SQLite + 별도 벡터 DB` 중심 아키텍처
2. 대규모 GPU 전제와 122B 야간 배치 사고방식
3. 크로스 프로젝트 raw 데이터 접근
4. "의존하게 만든다"는 직접적 표현

즉, HARP는 pLLM의 **제품 원칙**을 차용하되, 구현은 HARP의 현재 구조인
`PostgreSQL + workspace/session/deliverable` 중심 모델 위에 얹어야 한다.

---

## 1. What Maps Well to HARP

| pLLM 개념 | 왜 좋은가 | HARP식 번역 |
|------|------|------|
| 사용자는 구조화하지 않는다 | 채택 장벽을 가장 크게 낮춤 | 자료를 붙이면 HARP가 체크리스트/섹션/요약으로 정리 |
| 즉시 가치 + 나중 정제 | "올리는 순간 쓸 수 있어야" 사용됨 | source는 즉시 저장/검색, 나중에 summary/tag/checklist linkage 보강 |
| 조용한 지식 축적 | 조직 자산화의 채택 저항을 줄임 | 개인 작업공간 도구처럼 보이되 결과는 workspace memory로 축적 |
| 계층적 요약 압축 | 기록이 쌓여도 컨텍스트 길이 통제 가능 | 세션 요약 -> 템플릿 주간 요약 -> 관리자 집계 요약 |
| 능동적 안내 | 사용자가 질문하지 않아도 가치 제공 | 준비도 부족, 근거 부족, low-confidence 섹션 등을 먼저 안내 |

---

## 2. What Does **Not** Map Well

### 2.1 저장소 선택

pLLM은:

- SQLite
- SQLite-vec / ChromaDB
- 파일시스템 중심 레이어

를 전제로 한다.

HARP는 이미:

- PostgreSQL
- Drizzle ORM
- session/source/deliverable 중심 DB

구조가 있기 때문에 이 부분은 차용하지 않는다.

### 2.2 인프라 전제

pLLM은:

- 122B 야간 배치
- 2B 임베딩 모델
- 라우터 모델
- GPU 시간대 스케줄링

을 중심에 둔다.

HARP는 현재 그 규모까지 갈 필요가 없다.

차용할 것은:

- **즉시 처리와 지연 처리의 분리**

이지,

- **대형 모델/멀티모델 인프라 자체**

가 아니다.

### 2.3 크로스 프로젝트 인사이트

pLLM의 그룹장 전용 크로스 프로젝트 인사이트는 흥미롭지만, HARP에선 민감도가 더 높다.

HARP는 HR 보고/평가/제도 관련 데이터가 들어오기 때문에:

- raw cross-project access는 금지에 가깝고
- summary-only, aggregate-only, leader-only

조건이 먼저 만족돼야 한다.

즉, 이 기능은 **후순위**다.

---

## 3. HARP에 맞게 번역한 제품 원칙

### 원칙 1. 사용자는 정리하지 않는다

사용자는:

- 파일을 예쁘게 정리하지 않고
- 태그를 붙이지 않고
- 구조를 맞추지 않는다

그냥 붙이고 말한다.

HARP가 해야 할 일:

- source 요약
- 체크리스트 연결
- 태그 생성
- 핵심 사실 추출
- 섹션 후보 생성

### 원칙 2. 가치가 먼저 보여야 한다

업로드/대화 직후 바로 얻는 가치가 있어야 한다.

HARP에서의 즉시 가치:

- 지금 세션에서 바로 쓸 수 있는 참고 자료
- 준비도/빠진 항목 표시
- 보고서 초안 작성
- low-confidence 경고

### 원칙 3. 축적은 사용자에게 보상처럼 느껴져야 한다

사용자 인식:

- "내가 올린 자료가 다음 보고서 쓰기 쉬워진다"

조직 효과:

- 과거 세션/자료/산출물이 workspace memory로 누적된다

사용자가 느껴야 할 것은 "조직이 가져간다"가 아니라 "내 다음 작업이 빨라진다"다.

### 원칙 4. 긴 기록은 요약 계층으로 압축한다

원문만 계속 쌓이면 언젠가 retrieval과 prompt가 무너진다.

그래서 HARP는:

- 대화 원문
- 세션 요약
- 주간 템플릿 요약
- 관리자용 집계 요약

으로 압축 계층을 가져가야 한다.

### 원칙 5. AI는 먼저 말해야 한다

지금 HARP는 대체로 reactive하다.

다음 단계는 proactive다.

예:

- "현황 근거가 아직 부족합니다"
- "이번 초안은 시사점 confidence가 낮습니다"
- "직전 3건과 비교하면 제안 섹션이 약합니다"

---

## 4. HARP용 Product Loop

### 현재 루프

```text
사용자 자료 추가
사용자와 인터뷰
초안 생성
수정/승격
```

### pLLM 아이디어를 반영한 목표 루프

```text
사용자 자료 추가
즉시 검색/참조 가능
즉시 인터뷰/초안 작성 가능
유휴시간/야간에 source enrichment
세션 요약 축적
다음 보고서에서 더 좋은 retrieval
부족한 항목/근거를 능동적으로 안내
```

핵심 차이는:

- **입력 시점**과
- **정제 시점**을 분리하는 것

이다.

---

## 5. 이번에 분해한 설계 문서

pLLM의 철학을 HARP 구현 단위로 분해한 결과는 아래 세 장이다.

### 5.1 `docs/feature-source-enrichment.md`

목적:

- 사용자가 넣은 raw source를 나중에 AI가 정제하도록 만드는 설계

핵심:

- source 저장 즉시 사용 가능
- 이후 summary/tag/fact/checklist linkage 생성

### 5.2 `docs/feature-hierarchical-summaries.md`

목적:

- 대화와 산출물을 계층적 요약 구조로 압축하는 설계

핵심:

- 세션 요약
- 템플릿 주간 요약
- 이후 관리자 집계 요약으로 확장 가능

### 5.3 `docs/feature-proactive-guidance.md`

목적:

- 사용자가 먼저 묻지 않아도 HARP가 gap과 next action을 안내하는 설계

핵심:

- checklist gap
- evidence gap
- low-confidence section
- recent reference 대비 부족한 구조

---

## 6. Roadmap Recommendation

### Phase 1

우선 구현 가치가 큰 것:

1. `feature-source-enrichment.md`
2. `feature-hierarchical-summaries.md`
3. `feature-proactive-guidance.md`

이 순서가 좋은 이유:

- enrichment가 먼저 있어야
- summary quality가 올라가고
- summary가 있어야 proactive guidance가 더 똑똑해진다

### Phase 2

후순위:

- 관리자용 summary-only 집계 인사이트
- cross-project pattern analysis

조건:

- raw data 비노출
- 요약/집계 기반
- 역할 기반 접근 통제

---

## 7. Final Position

pLLM에서 HARP가 진짜로 가져와야 하는 것은:

- 벡터 DB 종류
- 파일 시스템 구조
- 대형 GPU 아키텍처

가 아니다.

가져와야 하는 것은:

> "사용자에게 당장 도움을 주면서, 그 과정에서 지식이 자연스럽게 축적되도록 만드는 제품 루프"

이다.

그래서 HARP에 맞는 다음 문서는:

- `feature-source-enrichment.md`
- `feature-hierarchical-summaries.md`
- `feature-proactive-guidance.md`

이 세 장으로 분해한다.
