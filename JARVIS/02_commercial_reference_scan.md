# 상용 SaaS 레퍼런스 스캔

목표는 HARP와 비슷한 제품을 찾는 것이 아니라, **HARP가 그대로 차용해도 될 제품 패턴**을 찾는 것입니다.

## 가장 중요한 상용 레퍼런스 10개
1. Notion AI
2. Coda AI
3. Microsoft 365 Copilot / Copilot Notebooks
4. Glean
5. Guru
6. Dust
7. Hebbia
8. Slite
9. Typeform Formless
10. Metaview

---

## 1) Notion AI
### 차용 포인트
- 문서 페이지 안에서 AI가 자연스럽게 작동하는 **page-native AI**
- 하나의 workspace 안에서 chat/search/writing/agents가 이어지는 경험
- meeting memory → document memory 루프

### HARP에 왜 중요한가
HARP도 "별도 챗봇"보다 **HR 보고서 페이지가 사용자를 도와주는 느낌**이 강해야 합니다.

### 그대로 베껴야 할 것
- 세션을 문서 중심으로 보는 UX
- page-level quick AI actions
- 과거 회의/자료/문서를 같은 문맥 안에서 재사용하는 흐름

### 피해야 할 것
- 너무 자유로운 blank canvas
- 무한 composition freedom

---

## 2) Coda AI
### 차용 포인트
- prose + table + automation + AI의 결합
- 텍스트를 단순 문서가 아니라 **운영 객체**처럼 다루는 방식
- 반복 템플릿을 실제 workflow로 연결하는 설계

### HARP에 왜 중요한가
HR 보고서는 글만이 아니라
- 상태
- 체크리스트
- 근거
- 승인
- 지표
를 함께 담아야 합니다.

### 그대로 베껴야 할 것
- section별 structured state
- report를 살아 있는 object로 다루는 설계
- narrative + structured data의 결합

---

## 3) Microsoft Copilot / Notebooks
### 차용 포인트
- notebook/dossier 모델
- 한 작업을 위해 필요한 자료를 하나의 bundle로 묶는 컨텍스트 packaging
- role-aware retrieval

### HARP에 왜 중요한가
HARP의 기본 단위를 "chat session"이 아니라 **report notebook**으로 승격시키면 훨씬 강해집니다.
구성요소:
- 인터뷰 대화
- source 자료
- 과거 관련 보고서
- draft
- promoted asset
- evidence snippets

---

## 4) Glean
### 차용 포인트
- permission-aware retrieval
- relevance + access control + answer trust를 함께 다룸
- 결과를 많이 주기보다 쓰기 좋은 형태로 압축

### HARP에 왜 중요한가
HARP는 검색이 목적이 아니라 **글쓰기용 retrieval**이 목적입니다.
즉, 섹션 작성을 돕는 근거를 보여줘야 합니다.

### 그대로 베껴야 할 것
- section별 evidence explainability
- 권한 기반 검색 가정
- 최근성/역할/유형 가중치

---

## 5) Guru
### 차용 포인트
- verified knowledge layer
- cited answers
- trust tier가 있는 지식 관리

### HARP에 왜 중요한가
HARP의 `promoted_asset`는 아주 좋은 씨앗입니다.
여기서 한 단계 더 가서:
- raw note
- final deliverable
- promoted asset
- verified standard asset
처럼 **신뢰 등급 레이어**를 만들면 제품이 강해집니다.

---

## 6) Dust
### 차용 포인트
- 내부적으로는 여러 specialist agents가 협업
- externally는 단일 흐름처럼 보이게 하는 구조

### HARP에 왜 중요한가
HARP도 장기적으로는 단일 챗봇보다
- interview coach
- evidence gap detector
- draft composer
- citation checker
- asset promoter
로 나뉘는 편이 맞습니다.

---

## 7) Hebbia
### 차용 포인트
- analyst-grade evidence review
- 행렬/비교형 문서 분석
- 근거 기반 synthesis

### HARP에 왜 중요한가
중요한 HR 보고서는 단일 초안 생성보다
**여러 자료/보고서/인터뷰를 비교해 근거를 행렬처럼 보는 모드**가 강력합니다.

### 그대로 차용할 기능
- matrix review mode
- source x report dimension 비교
- section별 evidence grid

---

## 8) Slite
### 차용 포인트
- lightweight knowledge UX
- 지식이 실제로 읽히는 정보구조
- function-specific knowledge packaging

### HARP에 왜 중요한가
promoted asset이 쌓이면 곧 knowledge graveyard가 될 수 있습니다.
Slite처럼 **가볍고 읽기 쉬운 자산 브라우징 UX**가 필요합니다.

---

## 9) Typeform Formless
### 차용 포인트
- form 대신 대화형 intake
- progressive elicitation
- 낮은 인지부하

### HARP에 왜 중요한가
HARP가 가장 잘할 수 있는 차별점 중 하나가 이것입니다.
사용자가 구조를 몰라도, 시스템이 하나씩 필요한 정보를 끌어내는 것.

---

## 10) Metaview
### 차용 포인트
- 대화/인터뷰 → decision-ready 구조화 결과물
- evidence snippets tied to structured summaries
- domain-specific note transformation

### HARP에 왜 중요한가
HR 보고도 결국 "대화나 산발적 메모를 경영/실무용 구조화 문서로 바꾸는 일"입니다.
Metaview의 구조화 요약 방식은 매우 직접적인 참고 대상입니다.

---

## 상용 레퍼런스에서 HARP가 우선 차용해야 할 5개
1. **Report Notebook** (Copilot/Notion)
2. **Section-level Evidence Panel** (Glean/Guru/Hebbia)
3. **Conversation-first Intake + Visible Structure** (Typeform/Metaview)
4. **Trust-tier Asset Promotion** (Guru)
5. **Internal Specialist-Agent Architecture** (Dust)
