# HARP를 강하게 만들 우선순위

## 원칙
지금 HARP가 더 강해지려면 모델을 바꾸는 것보다,
**문서 생성 → 근거 제시 → 협업 → 거버넌스** 순으로 제품을 키워야 합니다.

## Top 10 우선순위

### 1. Report Notebook 도입
세션을 단순 chat이 아니라 하나의 업무 단위로 승격:
- 인터뷰
- source
- draft
- evidence
- prior assets
- decisions

### 2. Section-level Evidence Panel
각 섹션에 대해
- 어떤 source를 썼는지
- 어떤 prior asset을 참조했는지
- confidence/freshness
를 바로 보여줘야 합니다.

### 3. Deliverable Versioning + Compare
현재 version 숫자만으로는 약합니다.
- diff view
- before/after compare
- reviewer comments
필수입니다.

### 4. Trust-tier Asset Promotion
자산 등급을 분리해야 합니다.
- raw source
- draft
- final deliverable
- promoted asset
- verified standard asset

### 5. Admin Template Management
템플릿을 코드에서 끄집어내 제품 기능으로 만들어야 합니다.
- template editor
- prompt versioning
- region/business variants
- required section policy

### 6. Shared Workspace / Review Workflow
실제 조직에서 쓰려면
- reviewer
- approver
- comments
- assign
- approval chain
이 있어야 합니다.

### 7. Permission / Access Model 강화
최소한 다음은 필요합니다.
- personal vs team vs org asset
- viewer/editor/approver/publisher
- confidential report restriction

### 8. Quality Evaluation Layer
- unsupported claim warning
- source sufficiency check
- template QA score
- human feedback capture

### 9. Source Ingestion / Export Layer
입력과 출력 둘 다 강화해야 합니다.
- SharePoint/Drive import
- Word/PPT/PDF export
- data/table parsing status

### 10. Product Taxonomy 정리
현재 문서상/코드상 템플릿 메시지가 살짝 어긋납니다.
상용화하려면 “무슨 제품인지”가 더 명확해야 합니다.

## 추천 전략
### 당장 밀 것 (1단계)
- Report Notebook
- Evidence Panel
- Version Compare
- Asset Browser

### 다음 단계 (2단계)
- Shared Workspace
- Review/Approval Workflow
- Template Admin
- Trust-tier Knowledge

### 상용화 직전 (3단계)
- SSO/SCIM
- Audit / Compliance
- Integrations
- Eval dashboards

## 최종 판단
HARP의 승부처는 더 좋은 채팅창이 아닙니다.
**“HR 문서를 더 빠르게 쓰게 해주는 AI”**에서 끝나면 약하고,
**“HR 문서를 신뢰 가능하게 만들고 조직 안에서 재사용/검토/승인되게 하는 운영체계”**가 되면 강해집니다.
