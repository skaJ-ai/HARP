# Kuse Cowork → HARP 차용안

목표는 Kuse Cowork를 통째로 가져오는 것이 아니라,
**HARP에 필요한 document operations / tool execution / trace 구조만 선택적으로 차용**하는 것입니다.

---

## 1) 기능 단위 차용안

### A. Document Ops Layer
HARP가 가장 먼저 차용할 가치가 있는 영역은 파일/문서 작업 capability 입니다.

도입 후보:
- `docx export`
- `pptx skeleton export`
- `xlsx summary export`
- `pdf/docx/xlsx ingest`

의미:
- 지금 HARP는 markdown 중심 초안 생성에는 강점이 있지만,
- 실제 HR 실무 산출물(Word/PPT/Excel)로 이어지는 마지막 mile이 약합니다.

즉, 이 차용안의 핵심은
**“잘 쓰는 초안”을 “실제 제출 가능한 포맷”으로 이어주는 층**을 만드는 것입니다.

### B. File-aware Source Processing
현재 HARP의 source는 텍스트 입력 중심 성격이 강합니다.
다음 기능을 추가하면 source의 질이 달라집니다.

도입 후보:
- 표 추출
- 문서 섹션 추출
- 파일 메타데이터 추출
- 페이지/시트 단위 parsing

효과:
- 근거자료가 단순 blob이 아니라 구조화된 source가 됨
- section별 근거 추적이 쉬워짐

### C. Evidence-backed Asset Packaging
최종 deliverable을 생성할 때 본문만 던지는 게 아니라,
다음 구성을 함께 만들 수 있어야 합니다.

도입 후보:
- 본문
- appendix
- source 목록
- 참고 근거 묶음
- export package

효과:
- “초안 생성기”가 아니라 “보고 패키지 생성기”로 진화 가능

### D. Trace / Execution Log
Kuse Cowork의 trace tracking 관점은 HARP에도 매우 중요합니다.

도입 후보:
- 어떤 파일을 읽었는지
- 어떤 단계로 처리했는지
- 어디까지 추론인지
- 어떤 section이 어떤 source에 기대는지

효과:
- HARP의 신뢰성/검수성 강화

---

## 2) 아키텍처 단위 차용안

핵심 원칙:
**Kuse 전체 통합이 아니라, HARP 바깥쪽에 Document Ops Layer를 두는 방식이 맞습니다.**

### A. HARP Core는 유지
현재 HARP의 중심축은 유지해야 합니다.
- Interview Layer
- Retrieval Layer
- Draft Generation Layer
- Asset Promotion Layer

이건 HARP의 정체성이므로 바꾸면 안 됩니다.

### B. Document Ops Layer 추가
추천 구조:

`HARP Core`
→ `Document Ops Service`
→ `Sandbox / Tool Runner`

이렇게 두면,
- HARP는 HR 문서 워크스페이스 정체성을 유지하고,
- 파일 처리/변환/패키징은 별도 계층에서 담당할 수 있습니다.

### C. Skill 개념은 내부 확장 포인트로만 사용
사용자에게 MCP/Skill을 그대로 노출하는 건 과합니다.
대신 내부적으로는 capability registry 형태가 적절합니다.

예시:
- `docx-skill`
- `pptx-skill`
- `xlsx-skill`
- `pdf-parse-skill`
- `report-package-skill`

즉,
- 외부 UX는 단순하게
- 내부 실행은 skill 구조로
가 적절합니다.

### D. 격리 실행은 선택 적용
Docker/sandbox는 모든 기능에 강제하기보다,
고위험 파일 작업에만 적용하는 게 좋습니다.

적용 대상 예:
- 파일 변환
- 문서 병합
- PPT/Excel 생성
- 외부 스크립트 기반 가공

---

## 3) MVP 우선순위 차용안

### 1순위 — 바로 넣을 것
#### A. Source file ingest
- pdf/docx/xlsx 업로드
- 텍스트/표 추출
- source library 구조화 저장

이건 현재 HARP의 가장 큰 약점 중 하나를 바로 메웁니다.

#### B. docx export
HR 실무에서 제일 먼저 필요한 포맷입니다.
PPT보다도 우선순위가 높습니다.

#### C. section-level evidence trace
각 section이 어떤 source를 기반으로 나왔는지 보이게 해야 합니다.

---

### 2순위 — 체감가치 큰 것
#### A. xlsx summary generation
예:
- 교육 결과
- 채용 현황
- HR KPI
를 요약표 형태로 생성

#### B. pptx skeleton export
완전한 deck보다 다음 정도만 먼저:
- 제목
- 핵심 메시지
- section 구조
- 차트 placeholder

#### C. working trace UI
- 읽은 파일
- 처리 단계
- 누락 근거
- 추정 문장
표시

---

### 3순위 — 나중에 넣을 것
#### A. sandboxed tool execution 고도화
처음부터 무겁게 넣지 말고, 파일 작업이 커질 때 도입

#### B. MCP connector layer
초반엔 과함. 외부 시스템 연결이 실제 필요해질 때 적용

#### C. 범용 cowork task 확장
절대 초반에 가면 안 됨. HARP 정체성이 흐려짐

---

## 4) 절대 넣지 말아야 할 것

### A. 범용 cowork agent 정체성
HARP가 generic task agent로 가면 vertical HR product의 강점을 잃습니다.

### B. Tauri/Rust 데스크톱 제품화 방향
Kuse는 desktop cowork agent이고, HARP는 web workspace입니다.
이 둘을 제품 차원에서 합치면 아키텍처만 복잡해집니다.

### C. 사용자 노출형 MCP/Skill UX
내부 구현으로는 좋지만, 초기 사용자에게 그대로 보여주면 복잡도만 증가합니다.

### D. 모든 기능의 Docker 격리 실행
보안상 좋아 보여도,
- 속도
- 운영 복잡성
- 디버깅 난도
가 급증합니다.
고위험 작업에만 제한하는 게 맞습니다.

### E. 제품 메시지를 “AI cowork agent”로 바꾸는 것
HARP의 메시지는 끝까지
- HR 보고서
- 근거 기반 초안
- 자산화
- 표준화
에 있어야 합니다.

---

## 최종 정리

### HARP가 Kuse Cowork에서 가져와야 할 것
- document operations capability
- docx/pptx/xlsx/pdf 처리
- trace visibility
- skill형 내부 구조
- 선택적 sandbox execution

### 가져오면 안 되는 것
- 범용 agent product identity
- desktop app direction
- 사용자 노출형 MCP 복잡도
- 전면적 Docker화

### 한 줄 결론
> Kuse Cowork는 HARP의 **Document Ops Layer** 레퍼런스로는 매우 유용하지만,
> **제품 전체 방향 레퍼런스**로 삼으면 안 됩니다.
