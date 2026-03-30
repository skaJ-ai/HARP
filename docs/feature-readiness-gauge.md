# Feature Design: 준비도 게이지 (Readiness Gauge)

> **문서 목적**: 구현 LLM이 준비도 게이지를 구현하기 위한 설계 스키마.
> **작성일**: 2026-03-29
> **리서치 근거**: Lattice의 "최소 데이터 임계값" 패턴 + 체크리스트 weight 기반 가중 합산
> **변경 파일**: 3개 (서비스 1, 컴포넌트 1, 타입 1)

---

## 0. 현재 상태 분석

### 이미 있는 것
- **체크리스트 아이템에 weight 필드** — `templates/index.ts:50-62`, 7개 아이템, weight 1~3
- **체크리스트 완료 개수 표시** — `session-canvas.tsx:262,422-423`, `{completedChecklistCount} / {total} 완료`
- **canGenerate 플래그** — `sessions/service.ts:258`, `Object.values(checklist).every(v => v)` (모든 항목 true일 때만)
- **정리하기 버튼 비활성화** — `session-canvas.tsx:428-430`, `!canGenerate` 일 때 disabled
- **Readiness 카드** — `session-canvas.tsx:480-498`, "생성 가능" / "정보 수집 필요" 이진 표시

### 없는 것 (이번에 추가할 것)
- **가중치 기반 퍼센트 계산** — 현재는 단순 개수 카운트, weight 미반영
- **퍼센트 프로그레스 바 UI** — 현재는 "N/M 완료" 텍스트만
- **항목별 가중치 시각화** — 체크리스트 탭에서 weight 표시 없음
- **임계값 경고** — "정리하기" 클릭 시 준비도 낮으면 경고 (현재는 차단만)

---

## 1. 핵심 설계 결정

### 1.1 준비도 공식

```
readinessPercent = (완료된 아이템의 weight 합) / (전체 아이템의 weight 합) × 100
```

현재 체크리스트 weight 합산:
| id | label | weight | 비중 |
|----|-------|--------|------|
| 1 | 목적 | 2 | 14.3% |
| 2 | 대상 | 1 | 7.1% |
| 3 | 현황 | 3 | 21.4% |
| 4 | 제안 | 2 | 14.3% |
| 5 | 기대효과 | 2 | 14.3% |
| 6 | 일정 | 1 | 7.1% |
| 7 | 근거/데이터 | 3 | 21.4% |
| **합계** | | **14** | **100%** |

예시: 목적(2) + 현황(3) + 근거(3) 완료 → 8/14 = 57%

### 1.2 정리하기 버튼 정책 변경

| 현재 | 변경 |
|------|------|
| canGenerate = 모든 항목 완료 | canGenerate 유지 (모든 항목 완료 시만 활성) |
| 미완료 시 버튼 disabled (무조건 차단) | **변경 없음** |
| (없음) | 준비도 70% 이상이면 "나머지 항목 없이 생성" 버튼 별도 추가 |

> **설계 판단**: canGenerate 로직은 건드리지 않는다. 대신 70% 이상일 때 보조 버튼을 추가해서 "불완전하지만 생성 가능" 경로를 열어준다. 이렇게 하면 기존 동작을 깨지 않는다.

### 1.3 임계값

| 구간 | 퍼센트 | UI 표현 |
|------|--------|---------|
| 낮음 | 0-49% | 프로그레스 바 `--color-error`, "핵심 항목이 부족합니다" |
| 보통 | 50-69% | 프로그레스 바 `--color-warning`, "일부 항목이 남아 있습니다" |
| 충분 | 70-99% | 프로그레스 바 `--color-teal`, "나머지 없이 정리 가능" + 보조 버튼 |
| 완료 | 100% | 프로그레스 바 `--color-success`, "정리하기" 메인 버튼 활성 |

---

## 2. 변경 파일별 스펙

### 2.1 `src/lib/sessions/service.ts` — readinessPercent 계산 추가

**변경 위치**: `getSessionDetailForWorkspace` 함수 리턴 객체 (L256-270 부근)

**추가 로직**:

```typescript
// checklist와 template checklist items로 readinessPercent 계산
const templateChecklist = getTemplateByType(sessionRow.templateType).checklist;
const totalWeight = templateChecklist.reduce((sum, item) => sum + item.weight, 0);
const completedWeight = templateChecklist
  .filter((item) => checklist[item.id] === true)
  .reduce((sum, item) => sum + item.weight, 0);
const readinessPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
```

**리턴 객체에 추가**:
```typescript
return {
  ...summary,
  canGenerate: Object.values(checklist).every((value) => value),
  readinessPercent,  // ← 추가
  // ... 기존 필드 유지
};
```

### 2.2 `src/lib/sessions/types.ts` — SessionDetail에 readinessPercent 추가

**변경 위치**: `SessionDetail` 인터페이스 (L80-87)

```typescript
interface SessionDetail extends SessionSummary {
  canGenerate: boolean;
  canvas: SessionCanvasState;
  latestDeliverable: DeliverableSummary | null;
  messages: SessionChatMessage[];
  readinessPercent: number;  // ← 추가 (0-100 정수)
  recentReferences: DeliverableSummary[];
  sources: SessionSourceSummary[];
}
```

### 2.3 `src/components/workspace/session-canvas.tsx` — UI 변경 3곳

#### 변경 A: Readiness 카드 교체 (L479-498)

현재 "Readiness" 카드를 프로그레스 바 포함 버전으로 교체:

```
┌─────────────────────────────────────────────┐
│ meta: Readiness                             │
│ h3: 초안 생성 준비도                          │
│ [████████████░░░░░░░░] 71%                  │
│ badge: "나머지 없이 정리 가능" (또는 상태 메시지) │
└─────────────────────────────────────────────┘
```

**프로그레스 바 구현**: 인라인 스타일로 width 퍼센트 적용. CSS 클래스는 `h-2 rounded-full` 기반.

```tsx
// 컴포넌트 본문 전에 선언 (JSX 밖)
const readinessPercent = currentSession.readinessPercent;

function getReadinessColor(percent: number): string {
  if (percent >= 100) return 'var(--color-success)';
  if (percent >= 70) return 'var(--color-teal)';
  if (percent >= 50) return 'var(--color-warning)';
  return 'var(--color-error)';
}

function getReadinessMessage(percent: number): string {
  if (percent >= 100) return '모든 항목이 채워졌습니다';
  if (percent >= 70) return '나머지 항목 없이 정리할 수 있습니다';
  if (percent >= 50) return '일부 항목이 남아 있습니다';
  return '핵심 항목이 부족합니다';
}

function getReadinessBadgeClassName(percent: number): string {
  if (percent >= 100) return 'badge-success';
  if (percent >= 70) return 'badge-teal';
  if (percent >= 50) return 'badge-warning';
  return 'badge-error';
}
```

**주의**: 이 3개 함수는 컴포넌트 함수 바깥(모듈 스코프)에 선언한다. CLAUDE.md의 "JSX 내 인라인 익명 함수 금지" 규칙 + 순수 함수이므로 컴포넌트 밖이 적합.

#### 변경 B: 상단 요약 영역 (L421-424)

현재: `{completedChecklistCount} / {total} 완료` badge

변경: `{readinessPercent}% 준비` badge + 동일 색상 체계

```tsx
<span className={`badge ${getReadinessBadgeClassName(readinessPercent)}`}>
  {readinessPercent}% 준비
</span>
```

#### 변경 C: "나머지 없이 정리하기" 보조 버튼 (L426-435 부근)

70% 이상 & 100% 미만일 때만 표시:

```tsx
{readinessPercent >= 70 && !currentSession.canGenerate ? (
  <button
    className="btn-secondary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
    disabled={isGenerateSubmitting || status !== 'ready'}
    onClick={handleGenerateButtonClick}
    type="button"
  >
    {isGenerateSubmitting ? '정리 중...' : '부족한 채로 정리하기'}
  </button>
) : null}
```

**주의**: 이 버튼은 기존 `handleGenerateButtonClick`을 그대로 사용한다. 단, 현재 `handleGenerateButtonClick`에 `canGenerate` 가드가 있을 수 있다:

```typescript
// session-canvas.tsx:226
if (!currentSession.canGenerate || isGenerateSubmitting || status !== 'ready') {
  return;
}
```

이 가드에서 `canGenerate` 체크를 `readinessPercent < 70`으로 변경해야 한다:

```typescript
if (readinessPercent < 70 || isGenerateSubmitting || status !== 'ready') {
  return;
}
```

이렇게 하면:
- 70% 미만: 생성 불가 (기존보다 약간 느슨하지만, 핵심 항목 weight가 높아서 실질적 차이 작음)
- 70-99%: "부족한 채로 정리하기" 보조 버튼으로 생성 가능
- 100%: "정리하기" 메인 버튼으로 생성 가능

---

## 3. 체크리스트 탭 보강 (L564-604)

현재 체크리스트 탭에서 각 아이템의 weight가 표시되지 않는다.

**추가**: 각 체크리스트 아이템 옆에 weight 시각화

```tsx
<div className="flex items-center gap-1">
  {Array.from({ length: item.weight }, (_, dotIndex) => (
    <span
      className={`status-dot ${isChecked ? 'status-dot-success' : 'status-dot-neutral'}`}
      key={dotIndex}
    />
  ))}
</div>
```

weight 1 = ●, weight 2 = ●●, weight 3 = ●●● — 직관적으로 중요도 표현.

---

## 4. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| `canGenerate` 서버 로직 | 기존 API 응답 호환성 유지. 클라이언트에서 readinessPercent로 추가 판단 |
| 체크리스트 weight 값 | 이미 적절한 분배 (현황·근거 3, 목적·제안·기대효과 2, 대상·일정 1) |
| 체크리스트 DB 스키마 | `SessionChecklist = Record<string, boolean>` 그대로. weight는 템플릿 정의에 있음 |
| 생성 프롬프트 | 준비도 게이지는 UI 기능. 프롬프트 변경 없음 |

---

## 5. CLAUDE.md 체크리스트

- [ ] 헬퍼 함수 3개는 컴포넌트 밖 모듈 스코프에 선언 (getReadinessColor, getReadinessMessage, getReadinessBadgeClassName)
- [ ] JSX 내 인라인 익명 함수 없음 — Array.from의 callback은 JSX가 아닌 데이터 생성이므로 허용. 단, 별도 함수로 추출해도 무방
- [ ] `readinessPercent`는 number 타입 (0-100 정수)
- [ ] 프로그레스 바 width는 인라인 style로 적용 (Tailwind arbitrary value도 가능하나, 동적 값이므로 style이 적합)
- [ ] import 순서 유지 — 새로운 import 없음 (기존 타입만 확장)
- [ ] `npm run harness:check` 통과 확인
- [ ] `npm run build` 통과 확인

---

## 6. 구현 순서

1. `types.ts` — SessionDetail에 `readinessPercent: number` 추가
2. `service.ts` — 계산 로직 추가, 리턴 객체에 포함
3. `session-canvas.tsx` — 헬퍼 함수 3개 추가 → Readiness 카드 교체 → 상단 badge 변경 → 보조 버튼 추가 → handleGenerateButtonClick 가드 변경 → 체크리스트 탭 weight 시각화
4. `npm run harness:check && npm run build`
