# 오픈소스 레퍼런스 스캔

HARP가 오픈소스에서 참고해야 할 것은 “비슷한 챗앱”이 아니라,
**문서 UX / retrieval transparency / admin workflow / workspace architecture** 입니다.

## 가장 중요한 오픈소스 레퍼런스
1. langchain-ai/open-canvas
2. Cinnamon/kotaemon
3. Mintplex-Labs/anything-llm
4. open-webui/open-webui
5. danny-avila/LibreChat
6. langgenius/dify
7. FlowiseAI/Flowise
8. langflow-ai/langflow
9. AppFlowy-IO/AppFlowy
10. outline/outline

---

## 1) open-canvas
- Repo: https://github.com/langchain-ai/open-canvas
- License: MIT

### 왜 중요한가
HARP와 가장 가까운 **chat + live artifact canvas** UX입니다.

### 차용 포인트
- dual-pane artifact workflow
- deliverable version history
- existing document로 시작하는 흐름
- section/document quick actions
- live markdown editing/rendering

### HARP가 바로 가져가야 할 것
- versioned deliverables
- “기존 보고서/예시에서 시작”
- section quick actions

---

## 2) kotaemon
- Repo: https://github.com/Cinnamon/kotaemon

### 왜 중요한가
retrieval과 citation UX를 제품적으로 보여주는 좋은 레퍼런스입니다.

### 차용 포인트
- citation preview/highlight
- low-relevance warning
- evidence transparency
- multi-modal parsing 아이디어

### HARP가 가져가야 할 것
- evidence drawer
- citation confidence chips
- weak evidence 상태 표시

---

## 3) AnythingLLM
- Repo: https://github.com/Mintplex-Labs/anything-llm

### 왜 중요한가
private workspace AI product의 운영 모델 참고용으로 좋습니다.

### 차용 포인트
- workspace abstraction
- source library UI
- admin ergonomics
- API-first integration surface

### HARP가 가져가야 할 것
- workspace settings
- source library
- ingestion status UX

---

## 4) Open WebUI
- Repo: https://github.com/open-webui/open-webui

### 왜 중요한가
self-hosted enterprise AI UX, 역할/권한, 확장성 참고에 좋습니다.

### 차용 포인트
- granular roles/permissions
- artifact/document library
- extensibility model
- provider swap UX

### HARP가 가져가야 할 것
- 관리자/권한 레이어
- artifact store abstraction
- future plugin/tool hooks

---

## 5) LibreChat
- Repo: https://github.com/danny-avila/LibreChat

### 왜 중요한가
production-grade chat ergonomics와 multi-provider 구조 참고용.

### 차용 포인트
- conversation branching
- presets/context packs
- resumable streams
- provider flexibility

### HARP가 가져가야 할 것
- branch before finalization
- HR 보고 스타일 preset
- 안정적인 stream UX

---

## 6) Dify
- Repo: https://github.com/langgenius/dify

### 왜 중요한가
하드코딩된 prompt/template를 장기적으로 **관리형 workflow**로 올릴 때 가장 중요한 레퍼런스입니다.

### 차용 포인트
- prompt IDE
- workflow builder
- execution traces
- eval dashboard

### HARP가 가져가야 할 것
- admin template editor
- prompt versioning
- template quality observability

---

## 7) Flowise
- Repo: https://github.com/FlowiseAI/Flowise
- License: Apache-2.0

### 왜 중요한가
pipeline modularization에 좋은 참고입니다.

### 차용 포인트
- 인터뷰 → retrieval → draft → assembly 를 분리된 단계로 보는 아키텍처
- integration-as-module 사고방식

---

## 8) Langflow
- Repo: https://github.com/langflow-ai/langflow
- License: MIT

### 왜 중요한가
workflow를 API/tool로 배포하는 개념 참고용.

### 차용 포인트
- template as deployable workflow
- playground/test mode
- section-level prompt testing

---

## 9) AppFlowy
- Repo: https://github.com/AppFlowy-IO/AppFlowy
- License: AGPL-3.0

### 왜 중요한가
promoted asset을 진짜 knowledge hub로 키울 때 문서 중심 workspace UX 참고용.

### 차용 포인트
- folder/tag/database 조직화
- document hub UX
- cross-linking between source, report, asset

### 주의
- AGPL이므로 직접 코드 차용에는 제약이 큽니다. 제품 아이디어 참고용이 적절합니다.

---

## 10) Outline
- Repo: https://github.com/outline/outline
- License: BSL 1.1

### 왜 중요한가
최종 deliverable viewer와 knowledge browser의 polished doc UX 참고용.

### 차용 포인트
- search-first doc retrieval
- fast navigation
- readable document presentation

### 주의
- BSL이므로 직접 차용보다 UX 레퍼런스 쪽이 안전합니다.

---

## 오픈소스에서 우선 차용할 것
1. **open-canvas** — artifact/document UX
2. **kotaemon** — citation/evidence transparency
3. **AnythingLLM** — workspace/source/admin model
4. **Open WebUI** — roles/permissions/extensibility
5. **Dify** — admin template workflow + prompt governance
