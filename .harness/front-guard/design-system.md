# HARP UI/UX Design System Guide: "Trust within Flow"

이 문서는 HARP 프로젝트의 프론트엔드 UI를 구축할 때 모든 LLM과 개발자가 반드시 준수해야 하는 디자인 시스템 및 컴포넌트 가이드라인입니다. (Stitch 기반 디자인 반영)

## 1. 핵심 철학 (Core Philosophy)
* **Tonal Elevation over Borders (선 대신 면):** 딱딱한 1px 실선(solid border)으로 구역을 나누는 것을 지양합니다. 배경색의 명도 차이(Background shifts)와 여백(Negative space)으로 계층을 분리하세요.
* **Atmospheric Depth (분위기 있는 깊이감):** 진하고 무거운 Drop Shadow 대신, 은은한 Ambient Shadow와 유리 질감(backdrop-blur)을 활용해 화면의 깊이감을 만듭니다.
* **Intentional Whitespace (의도된 여백):** UI 요소들을 빽빽하게 붙이지 마세요. `gap-6`, `gap-8` 등 넓은 여백을 적극적으로 활용하여 시선을 유도합니다.

## 2. 표면(Surface) 및 컬러 로직
임의의 Hex 컬러(예: `bg-[#ffffff]`) 사용을 절대 금지합니다. 반드시 `globals.css`에 정의된 CSS 변수를 Tailwind 클래스 형태로 사용하세요.

### Background 계층
* `bg-[var(--color-bg)]` (Level 0): 가장 바닥이 되는 베이스 캔버스
* `bg-[var(--color-bg-sunken)]` (Level 1): 사이드바, 큰 피드 영역 등 묶음 배경
* `bg-[var(--color-bg-elevated)]` (Level 2): 개별 카드, 입력 폼, 모듈 형태 (가장 밝음)

### Typography 컬러
* 절대 순수 블랙(`#000000`)을 쓰지 마세요.
* `text-[var(--color-text)]`: 기본 텍스트 (Deep Gray)
* `text-[var(--color-text-secondary)]`: 부가 설명, 본문 텍스트
* `text-[var(--color-text-tertiary)]`: 메타데이터, 아주 연한 텍스트

### 포인트 컬러 (Brand)
* **Core Blue (`var(--color-accent)`):** 신뢰감을 주는 메인 브랜드 컬러 (Primary CTA, 강조)
* **Action Teal (`var(--color-teal)`):** AI 인사이트, 긍정적 상태 변화, 생성 액션 등 특별한 포인트에 사용

## 3. 공통 컴포넌트 클래스 (Signature Components)
기존에 생성된 공용 클래스들을 재사용하여 시각적 일관성을 유지해야 합니다. 풀어서 작성하지 마세요.

* **Cards:**
  * `.workspace-card`: 기본 카드 컴포넌트 (Elevated, 옅은 shadow와 border)
  * `.workspace-card-muted`: 보조 카드 컴포넌트 (Sunken, 회색 배경)
* **Buttons:**
  * `.btn-primary`: 메인 액션 (Gradient Blue)
  * `.btn-teal`: AI 액션, 긍정적 상태 액션
  * `.btn-secondary`: 보조 액션 (투명 배경 + Ghost Border)
* **Inputs:**
  * `.input-surface`: 모든 텍스트 입력창, Select, Textarea에 적용
* **Badges:**
  * `.badge.badge-neutral`: 일반 상태, 메타 정보
  * `.badge.badge-accent`: 중요 상태, 브랜드 강조
  * `.badge.badge-teal`: 최적화, 완료, AI 제안
* **Typography Elements:**
  * `.meta`: 모노스페이스의 작은 라벨 (주로 카드 상단 섹션명)
  * `.section-label`: 대문자, 자간이 넓은 모노스페이스 라벨 (페이지/영역 제목 위)

## 4. 엄격한 금지 사항 (Do Nots)
1. **과도한 선(Line) 사용 금지:** 모든 컨테이너마다 테두리(border)를 치지 마세요. `gap`을 먼저 늘려보세요.
2. **깊이감 중첩 금지:** 표면(Surface) 컨테이너를 3단계 이상 중첩(카드 안의 카드 안의 카드)하지 마세요. "Flow"가 깨지고 산만해집니다.
3. **인라인 스타일 및 임의 컬러 남용 금지:** `rounded-[15px]` 등 하드코딩된 값을 피하고, `rounded-[var(--radius-md)]` 등 토큰을 사용하세요.
4. **그림자 남용 금지:** `.shadow-md` 등을 무분별하게 쓰지 말고 컴포넌트에 이미 정의된 상태(예: hover 시 `shadow-[var(--shadow-2)]`)를 활용하세요.
