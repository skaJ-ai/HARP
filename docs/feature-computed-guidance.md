# Feature Design: Computed Guidance (경량 능동 안내)

> **문서 목적**: 구현 LLM이 HARP에서 사용자에게 다음 행동을 먼저 안내하는 기능을 구현하기 위한 설계 스키마.
> **작성일**: 2026-03-31
> **리서치 근거**: pLLM "AI는 먼저 말해야 한다" 원칙 → HARP 현재 데이터로 실현 가능한 경량 버전
> **변경 파일**: 1개 (session-canvas.tsx)

---

## 0. 현재 상태 분석

### 이미 있는 데이터

`SessionDetail`에 guidance 재료가 전부 들어 있다:

```typescript
// session-canvas.tsx에서 currentSession으로 접근 가능
currentSession.checklist           // Record<string, boolean>
currentSession.readinessPercent    // 0-100
currentSession.sources             // SessionSourceSummary[]
currentSession.canvas.sections     // SessionCanvasSection[] (status: 'complete' | 'empty')
currentSession.recentReferences    // DeliverableSummary[]
currentSession.latestDeliverable   // DeliverableSummary | null
currentSession.template.checklist  // TemplateChecklistItem[] (weight 포함)
```

### 현재 UX의 문제

이 데이터는 캔버스 탭 여기저기 **흩어져** 보인다:
- 준비도 게이지 — 숫자만 보임, "그래서 뭘 해야 하는데?"가 없음
- 체크리스트 — 대기/완료 보이지만 뭘 먼저 해야 하는지 안내 없음
- source 탭 — 0개여도 별도 경고 없음

**사용자가 직접 해석해야 한다.** 시스템이 "지금 이거 하세요"를 말하지 않는다.

---

## 1. 핵심 설계 결정

### 1.1 새 테이블 없음 — 순수 computed

| 접근 | 장점 | 단점 |
|------|------|------|
| **Computed (채택)** | 코드 1개 파일, DB 변경 없음, 즉시 배포 | dismiss 상태 비영속 |
| Stored (guidance 테이블) | dismiss 영속, 분석 가능 | 테이블+서비스+훅 필요, 과설계 |

guidance는 세션 데이터가 바뀌면 자연스럽게 해소된다 (source 추가 → "근거 부족" 사라짐). dismiss 영속이 MVP에서 필수가 아니다.

### 1.2 규칙 기반 — LLM 호출 없음

모든 guidance는 `if (조건)` 수준의 deterministic 규칙이다. LLM이 문구를 쓰지 않는다. 디버깅 가능하고 예측 가능하다.

### 1.3 guidance는 "다음 행동"까지 준다

나쁜 예: "현황이 부족합니다"
좋은 예: "현황 항목이 비어 있습니다. 현재 상태 수치를 인터뷰에서 말씀해 주세요." + **[인터뷰 이어가기]** 버튼

title + description + CTA(선택적). CTA는 기존 UI 액션(탭 전환, 채팅 입력)에 연결한다.

---

## 2. Guidance 규칙

### 2.1 타입 정의

```typescript
type GuidanceKind = 'first_deliverable' | 'high_weight_gap' | 'many_empty_sections' | 'no_sources';
type GuidancePriority = 'high' | 'low' | 'medium';

type GuidanceCtaAction = 'focus_chat' | 'switch_tab_sources';

interface GuidanceItem {
  ctaAction?: GuidanceCtaAction;
  ctaLabel?: string;
  description: string;
  kind: GuidanceKind;
  priority: GuidancePriority;
  title: string;
}
```

### 2.2 규칙 목록

| Kind | 조건 | 우선순위 | Title | Description | CTA |
|------|------|----------|-------|-------------|-----|
| `high_weight_gap` | weight≥3 체크리스트 항목 미완료 | high | "{label} 항목이 비어 있습니다" | "{helpText}" | "인터뷰 이어가기" → `focus_chat` |
| `no_sources` | `sources.length === 0` | medium | "근거자료가 아직 없습니다" | "관련 데이터나 문서를 추가하면 초안 품질이 높아집니다." | "자료 추가하기" → `switch_tab_sources` |
| `many_empty_sections` | empty 섹션이 전체의 50% 초과 | medium | "캔버스의 {n}개 섹션이 아직 비어 있습니다" | "인터뷰를 이어가면 HARP가 자동으로 채워갑니다." | "인터뷰 이어가기" → `focus_chat` |
| `first_deliverable` | `recentReferences.length === 0` | low | "이 유형의 첫 산출물입니다" | "이번 초안이 다음부터 참고 기준이 됩니다." | 없음 |

### 2.3 표시하지 않는 조건

- `isPreviewMode === true` → 프리뷰 중에는 guidance 숨김
- `readinessPercent === 100` → 모든 항목 채움 → `high_weight_gap` 자동 소멸
- `currentSession.status === 'completed'` → 완료 세션에서는 guidance 불필요

### 2.4 최대 표시 개수

```typescript
const GUIDANCE_MAX_VISIBLE_ITEMS = 3;
```

priority 순 정렬 후 상위 3개만 표시. 나머지는 잘린다.

---

## 3. 변경 파일 스펙

### 3.1 `src/components/workspace/session-canvas.tsx`

이 파일 **하나만** 변경한다.

#### 상수 추가

```typescript
const GUIDANCE_HIGH_WEIGHT_THRESHOLD = 3;
const GUIDANCE_EMPTY_SECTION_RATIO_THRESHOLD = 0.5;
const GUIDANCE_MAX_VISIBLE_ITEMS = 3;

const GUIDANCE_PRIORITY_ORDER: Record<GuidancePriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
```

#### 타입 추가 (파일 상단, interface 블록)

```typescript
type GuidanceKind = 'first_deliverable' | 'high_weight_gap' | 'many_empty_sections' | 'no_sources';
type GuidancePriority = 'high' | 'low' | 'medium';
type GuidanceCtaAction = 'focus_chat' | 'switch_tab_sources';

interface GuidanceItem {
  ctaAction?: GuidanceCtaAction;
  ctaLabel?: string;
  description: string;
  kind: GuidanceKind;
  priority: GuidancePriority;
  title: string;
}
```

#### 순수 함수: `computeGuidanceItems`

return 전, 핸들러 블록 앞에 위치:

```typescript
function computeGuidanceItems(session: SessionDetail): GuidanceItem[] {
  const items: GuidanceItem[] = [];

  // 1. high_weight_gap — weight≥3 체크리스트 미완료
  const highWeightGaps = session.template.checklist.filter(
    (item) => item.weight >= GUIDANCE_HIGH_WEIGHT_THRESHOLD && session.checklist[item.id] !== true,
  );

  for (const gap of highWeightGaps) {
    items.push({
      ctaAction: 'focus_chat',
      ctaLabel: '인터뷰 이어가기',
      description: gap.helpText,
      kind: 'high_weight_gap',
      priority: 'high',
      title: `${gap.label} 항목이 비어 있습니다`,
    });
  }

  // 2. no_sources
  if (session.sources.length === 0) {
    items.push({
      ctaAction: 'switch_tab_sources',
      ctaLabel: '자료 추가하기',
      description: '관련 데이터나 문서를 추가하면 초안 품질이 높아집니다.',
      kind: 'no_sources',
      priority: 'medium',
      title: '근거자료가 아직 없습니다',
    });
  }

  // 3. many_empty_sections
  const totalSections = session.canvas.sections.length;
  const emptySections = session.canvas.sections.filter(
    (section) => section.status === 'empty',
  );

  if (totalSections > 0 && emptySections.length / totalSections > GUIDANCE_EMPTY_SECTION_RATIO_THRESHOLD) {
    items.push({
      ctaAction: 'focus_chat',
      ctaLabel: '인터뷰 이어가기',
      description: '인터뷰를 이어가면 HARP가 자동으로 채워갑니다.',
      kind: 'many_empty_sections',
      priority: 'medium',
      title: `캔버스의 ${emptySections.length}개 섹션이 아직 비어 있습니다`,
    });
  }

  // 4. first_deliverable
  if (session.recentReferences.length === 0) {
    items.push({
      description: '이번 초안이 다음부터 참고 기준이 됩니다.',
      kind: 'first_deliverable',
      priority: 'low',
      title: '이 유형의 첫 산출물입니다',
    });
  }

  // priority 정렬 후 상위 N개
  items.sort((a, b) => GUIDANCE_PRIORITY_ORDER[a.priority] - GUIDANCE_PRIORITY_ORDER[b.priority]);

  return items.slice(0, GUIDANCE_MAX_VISIBLE_ITEMS);
}
```

이 함수는 **컴포넌트 외부**, 모듈 스코프에 선언한다 (side effect 없는 순수 함수).

#### 상태 추가

```typescript
const [dismissedGuidanceKinds, setDismissedGuidanceKinds] = useState<string[]>([]);
```

기존 state 선언 블록에서 알파벳순 위치.

#### 파생 값

```typescript
const guidanceItems = currentSession.status === 'completed'
  ? []
  : computeGuidanceItems(currentSession).filter(
      (item) => !dismissedGuidanceKinds.includes(item.kind),
    );
```

기존 파생 값(`readinessPercent`, `readinessBadgeClassName` 등) 블록에 위치.

#### 핸들러 추가

```typescript
const handleGuidanceCtaClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
  const action = event.currentTarget.dataset.guidanceAction;

  if (action === 'focus_chat') {
    chatInputRef.current?.focus();
  }

  if (action === 'switch_tab_sources') {
    setActiveTab('tools');
  }
};

const handleGuidanceDismiss = (event: ReactMouseEvent<HTMLButtonElement>) => {
  const kind = event.currentTarget.dataset.guidanceKind;

  if (kind) {
    setDismissedGuidanceKinds((previous) => [...previous, kind]);
  }
};
```

알파벳순으로 기존 핸들러 사이에 위치.

참고: `chatInputRef`가 현재 코드에 없으면 `focus_chat` 액션은 단순히 `setActiveTab`이나 스크롤로 대체할 수 있다. 구현 LLM이 기존 채팅 입력 접근 방식에 맞춰 조정한다.

#### 렌더 헬퍼: `renderGuidanceCard`

```typescript
const renderGuidanceCard = (item: GuidanceItem) => {
  const priorityBadgeClassName =
    item.priority === 'high'
      ? 'badge-error'
      : item.priority === 'medium'
        ? 'badge-warning'
        : 'badge-neutral';

  return (
    <div
      className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3"
      key={item.kind}
    >
      <span className={`badge mt-0.5 shrink-0 ${priorityBadgeClassName}`}>
        {item.priority === 'high' ? '중요' : item.priority === 'medium' ? '참고' : '안내'}
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-[var(--color-text)]">{item.title}</p>
        <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
          {item.description}
        </p>
        {item.ctaLabel ? (
          <button
            className="mt-1 self-start text-xs font-semibold text-[var(--color-accent)] hover:underline"
            data-guidance-action={item.ctaAction}
            onClick={handleGuidanceCtaClick}
            type="button"
          >
            {item.ctaLabel}
          </button>
        ) : null}
      </div>
      <button
        className="shrink-0 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
        data-guidance-kind={item.kind}
        onClick={handleGuidanceDismiss}
        type="button"
      >
        닫기
      </button>
    </div>
  );
};
```

#### JSX 삽입 위치

캔버스 탭, **프리뷰 모드가 아닐 때**, 준비도 카드 **위에** 삽입:

```tsx
{isCanvasTabActive ? (
  <div className="flex flex-col gap-5">
    {isPreviewMode ? (
      // ... 프리뷰 패널 (기존 그대로)
    ) : (
      <>
        {/* === NEW: Guidance 카드 영역 === */}
        {guidanceItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {guidanceItems.map(renderGuidanceCard)}
          </div>
        ) : null}

        {/* 기존: 에러/메시지 → 준비도 카드 → 최근 초안 → 섹션 카드 */}
        {generateError.length > 0 ? ( ... ) : null}
        {/* ... 나머지 기존 코드 ... */}
      </>
    )}
  </div>
) : null}
```

**중요**: guidance 카드는 준비도 카드 위, 에러 메시지 아래에 위치한다. 프리뷰 모드에서는 렌더링하지 않는다.

---

## 4. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| DB 스키마 | 새 테이블 없음 |
| API 라우트 | 새 엔드포인트 없음 |
| 서비스 레이어 | 변경 없음 |
| 준비도 게이지 | 기존 기능 유지, guidance는 그 위의 행동 계층 |
| 체크리스트 도움말 | 기존 기능 유지, guidance와 역할 다름 |
| 인터뷰 프롬프트 | 변경 없음 |

---

## 5. CLAUDE.md 체크리스트

- [ ] `computeGuidanceItems`는 컴포넌트 외부 순수 함수 (모듈 스코프)
- [ ] 타입/인터페이스 알파벳순
- [ ] 상수 SCREAMING_SNAKE_CASE
- [ ] `dismissedGuidanceKinds` 상태는 알파벳순 위치
- [ ] `handleGuidanceCtaClick`, `handleGuidanceDismiss` 핸들러 알파벳순 위치
- [ ] JSX 내 인라인 익명 함수 없음
- [ ] guidance 카드는 `isPreviewMode === false && isCanvasTabActive === true` 조건에서만 렌더링
- [ ] `npm run harness:check` 통과
- [ ] `npm run build` 통과

---

## 6. 구현 순서

1. `session-canvas.tsx` — 타입 추가 (`GuidanceItem` 등)
2. `session-canvas.tsx` — 상수 추가 (`GUIDANCE_*`)
3. `session-canvas.tsx` — `computeGuidanceItems` 순수 함수 추가
4. `session-canvas.tsx` — `dismissedGuidanceKinds` 상태 + `guidanceItems` 파생 값 추가
5. `session-canvas.tsx` — 2개 핸들러 추가
6. `session-canvas.tsx` — `renderGuidanceCard` 렌더 헬퍼 추가
7. `session-canvas.tsx` — 캔버스 탭 JSX에 guidance 영역 삽입
8. `npm run harness:check && npm run build`

---

## 7. 검증 방법

1. **새 세션 시작 직후** → "현황 항목이 비어 있습니다" + "근거/데이터 항목이 비어 있습니다" + "근거자료가 아직 없습니다" 카드 표시 확인
2. **체크리스트 항목 완료 시** → 해당 `high_weight_gap` guidance 자동 소멸 확인
3. **source 추가 시** → "근거자료가 아직 없습니다" guidance 자동 소멸 확인
4. **"닫기" 클릭** → 해당 guidance 카드 사라짐 확인
5. **CTA "인터뷰 이어가기"** → 채팅 입력에 포커스 이동 확인
6. **CTA "자료 추가하기"** → tools 탭으로 전환 확인
7. **프리뷰 모드 진입** → guidance 카드 숨김 확인
8. **최대 3개** → guidance가 4개 이상이어도 상위 3개만 표시 확인

---

## 8. 향후 확장 가능성 (이번 스코프 아님)

| 확장 | 설명 |
|------|------|
| 생성 후 low-confidence guidance | `DeliverableDetail.sections`의 confidence 기반 — SessionDetail에 sections 데이터 포함 필요 |
| dismiss 영속화 | sessions 테이블에 `dismissed_guidance_kinds: string[]` jsonb 추가 |
| LLM 기반 문구 다듬기 | deterministic 규칙의 title/description을 LLM이 자연스럽게 rewrite |
| guidance 테이블 분리 | 분석/통계가 필요해지면 별도 테이블로 이관 |
