# 엔터프라이즈 HR 제품 기준 갭 분석

## 핵심 결론
HARP는 현재 **좋은 개인용 AI 문서 워크벤치**에 가깝고,
실제 엔터프라이즈 HR 플랫폼이 되려면 제어면(control plane)이 크게 부족합니다.

## 가장 큰 공백
### 1. Org / Workspace 모델 부족
현재는 거의 1인 1 workspace입니다.
실제 배포에는 다음이 필요합니다.
- 팀 workspace
- business unit workspace
- project/confidential space
- ownership transfer / archive

### 2. 세분 권한 없음
현재 user/admin 정도로는 HR 환경에서 부족합니다.
필요한 권한 예:
- viewer / editor / reviewer / approver / publisher
- template admin / workspace admin
- executive-only / regional restriction

### 3. 협업/검토 흐름 부재
현재는 거의 single-author flow입니다.
필요한 기능:
- review request
- comments / suggested edits
- version compare
- assign reviewer / approver
- approval history

### 4. 템플릿 거버넌스 부재
현재 템플릿이 코드에 묶여 있어 제품화가 약합니다.
필요한 기능:
- admin template builder
- template draft/publish versioning
- region/business variant
- required/optional section control
- prompt/policy versioning

### 5. audit / compliance / traceability 부족
HR 제품은 private-first 만으로는 부족합니다.
필요한 기능:
- 누가 보고/수정/승인/내보냈는지 audit trail
- source → section traceability
- retention/deletion policy
- sensitive content flags
- legal/compliance 대응 로그

### 6. 평가 체계 부족
confidence/cited는 useful하지만 충분치 않습니다.
필요한 기능:
- unsupported claim detection
- quality evaluation workflow
- template별 품질지표
- human review feedback loop
- source-backed section scoring

### 7. 연동성 부족
현재는 copy-paste source 중심입니다.
실제 배포에는 다음 연동이 필요합니다.
- SharePoint / Google Drive / Confluence
- Word / PPT / Excel / PDF export
- HRIS / ATS / LMS / survey tools
- Slack / Teams / email sharing
- SSO / SCIM / IdP

## 가장 현실적인 해석
지금의 HARP는 파일럿/팀 생산성 도구로는 충분히 말이 됩니다.
하지만 실제 기업 HR 플랫폼이 되려면,
**문서 생성 기능보다 조직 운영/관리/통제/연동 레이어가 훨씬 더 많이 필요합니다.**
