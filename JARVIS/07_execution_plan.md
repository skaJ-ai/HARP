# HARP 실행 계획서 (Kuse Cowork 차용안 반영)

이 문서는 `06_kuse_cowork_adoption_plan.md`를 실제 개발 관점으로 번역한 실행 계획서입니다.
핵심 목표는 다음입니다.

> HARP를 generic agent tool로 바꾸지 않고,
> **HR 보고서 워크스페이스 + evidence retrieval + document operations** 구조로 확장한다.

---

## 1. 제품 목표 재정의

HARP의 다음 단계 목표는 단순히 “더 잘 쓰는 AI”가 아닙니다.
다음 세 가지를 동시에 만족해야 합니다.

1. **잘 묻는다**
   - 인터뷰 기반 intake
   - 부족한 정보 추적
   - 구조화된 draft 생성

2. **잘 근거를 댄다**
   - source 기반 section 작성
   - prior asset 재활용
   - section-level evidence trace

3. **실무 포맷으로 끝낸다**
   - docx / xlsx / pptx export
   - appendix/evidence packaging
   - review-friendly package generation

즉, HARP는 이제부터
**“보고서 초안 생성기”가 아니라 “보고서 작업 운영체계”**로 진화해야 합니다.

---

## 2. Phase 1 — Source / Evidence 기반 강화

### 목표
텍스트 붙여넣기 중심 구조를 넘어서,
실제 파일 기반 HR 작업이 가능한 foundation을 만든다.

### 기능
#### A. Source File Ingest
- pdf 업로드
- docx 업로드
- xlsx 업로드
- 파일 메타데이터 저장
- 파싱 상태 저장
- 추출 텍스트/표 저장

#### B. Source 구조화
현재 source는 거의 content blob인데, 다음 구조가 필요합니다.
- source type
- source title
- source origin
- parsed blocks
- extracted tables
- page/sheet reference

#### C. Evidence Trace 초석
생성 단계에서 각 section에 대해
- 사용 source id
- 참고 block/table id
- confidence
를 저장할 수 있게 한다.

### DB 영향
추가 후보 테이블/필드:
- `sources.fileName`
- `sources.mimeType`
- `sources.parseStatus`
- `source_blocks` (page/block/table 단위)
- `deliverable_section_evidence`

### API 영향
신규/변경 필요:
- `POST /api/sessions/:id/source/upload`
- `GET /api/sources/:id/blocks`
- `GET /api/deliverables/:id/evidence`

### UI 영향
- Source 업로드 UI 추가
- source parsing status badge
- section별 evidence preview entrypoint

### 완료 기준
- PDF/Word/Excel 파일을 source로 넣을 수 있다
- 각 section에 어떤 source가 쓰였는지 최소 수준으로 보인다

---

## 3. Phase 2 — Document Ops Layer 추가

### 목표
생성된 draft를 실제 실무 산출물 포맷으로 내보낼 수 있게 한다.

### 기능
#### A. docx export
- 현재 deliverable markdown/section 구조를 Word 문서로 export
- 섹션 제목/본문/부록 구조 반영

#### B. xlsx summary export
- KPI/수치성 보고서에서 표를 추출해 summary sheet 생성
- 최소한 training/result/status류 템플릿에 우선 적용

#### C. pptx skeleton export
- 제목
- 핵심 이슈
- 섹션 outline
- 근거/차트 placeholder

### 아키텍처
신규 내부 레이어:
- `DocumentOpsService`
- `ExportJobRunner`
- `DocumentSkillRegistry`

예시 구조:
- `docx-export-skill`
- `xlsx-summary-skill`
- `pptx-outline-skill`

### DB 영향
추가 후보:
- `export_jobs`
- `export_artifacts`
- `deliverables.lastExportedAt`

### API 영향
- `POST /api/deliverables/:id/export/docx`
- `POST /api/deliverables/:id/export/xlsx`
- `POST /api/deliverables/:id/export/pptx`
- `GET /api/export-jobs/:id`

### UI 영향
- deliverable viewer에 export actions 추가
- export job status UI
- 다운로드 링크

### 완료 기준
- final deliverable에서 docx export 가능
- 일부 템플릿에서 xlsx/pptx skeleton export 가능

---

## 4. Phase 3 — Trace / Explainability Layer

### 목표
HARP 출력물의 신뢰성과 검수성을 높인다.

### 기능
#### A. Section-level Evidence Panel
각 section에서 바로 확인 가능해야 함:
- 어떤 source를 썼는지
- 어떤 prior asset을 참조했는지
- 어떤 부분이 추정인지
- freshness / confidence

#### B. Working Trace UI
생성 중/생성 후에 다음을 보여줌:
- 읽은 자료 수
- retrieval 결과 수
- inference-heavy section
- missing evidence warning

#### C. Weak Evidence 상태
source가 부족하거나 citation이 약한 section은
명시적으로 “추정 비중 높음” 상태를 띄움.

### DB 영향
- `deliverable_sections` 정규화 고려
- `deliverable_section_evidence`
- `generation_traces`

### API 영향
- `GET /api/deliverables/:id/trace`
- `GET /api/deliverables/:id/evidence`

### UI 영향
- section drawer / evidence drawer
- trace timeline
- confidence/freshness chip

### 완료 기준
- 사용자가 “왜 이렇게 작성됐는지”를 section 단위로 볼 수 있다
- reviewer가 추정 섹션만 빠르게 검토할 수 있다

---

## 5. Phase 4 — Controlled Execution / Sandbox

### 목표
고위험 문서 작업을 안전하게 실행할 수 있는 기반을 만든다.

### 적용 대상
모든 작업이 아니라 아래에 한정:
- 파일 변환
- 문서 병합
- pptx/docx/xlsx 생성
- 고비용 파싱 작업

### 구조
- `ToolRunner`
- `SandboxAdapter`
- `ExecutionPolicy`

### 원칙
- 인터뷰/생성은 기본적으로 기존 app server 흐름 유지
- 파일 조작 계층만 격리 실행
- 초기에는 로컬 프로세스 제한 실행 → 이후 sandbox 심화 가능

### 위험
- 운영 난도 증가
- 배포 복잡도 증가
- 디버깅 난도 증가

### 완료 기준
- document ops가 core app과 분리된 실행 경로를 가진다
- 실패 시 trace와 에러 메시지가 사용자에게 충분히 보인다

---

## 6. Phase 5 — Productization 연결

Kuse 차용 자체보다 더 중요한 건,
이 확장안이 결국 HARP의 상용화 방향과 연결돼야 한다는 점입니다.

### 연결 포인트
#### A. Asset Trust Tier
- raw source
- draft
- final deliverable
- promoted asset
- verified standard asset

#### B. Review Workflow 연결
trace와 evidence panel은 단독 기능이 아니라,
향후 reviewer/approver workflow의 기반이 됩니다.

#### C. Template Governance 연결
document ops/export는 템플릿마다 다르게 동작해야 하므로,
장기적으로 template admin 체계와 연결되어야 합니다.

---

## 7. 우선순위 결론

### 지금 바로 해야 할 것
1. source file ingest
2. evidence trace 최소 구조
3. docx export

### 그 다음
4. xlsx summary export
5. pptx skeleton export
6. section evidence panel

### 나중에
7. sandboxed execution
8. MCP/connector layer
9. fully modular skill runtime

---

## 8. 절대 잊지 말아야 할 원칙

### 원칙 1
HARP는 **HR 보고서 워크스페이스**여야지,
범용 cowork agent가 되면 안 됩니다.

### 원칙 2
Kuse에서 가져올 것은 제품 정체성이 아니라,
**document operations capability** 입니다.

### 원칙 3
사용자 UX는 더 단순해야 합니다.
복잡한 skill/MCP/tool 구조는 내부 구현에 가둬야 합니다.

### 원칙 4
가장 먼저 강화할 것은 모델이 아니라
**근거, trace, export** 입니다.

---

## 최종 한 줄

> Kuse Cowork 차용안의 정답은
> **“HARP를 cowork agent로 바꾸는 것”이 아니라,
> HARP 뒤에 document operations layer를 붙여 실제 실무 산출물까지 닿게 만드는 것**입니다.
