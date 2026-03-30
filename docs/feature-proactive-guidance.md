# Feature Design: Proactive Guidance

> **문서 목적**: 구현 LLM이 HARP에서 사용자가 묻기 전에 gap과 next action을 먼저 안내하는 기능을 구현하기 위한 설계 문서.
> **작성일**: 2026-03-30
> **상위 문서**: `docs/product-borrowing-from-pllm.md`
> **변경 파일 예상 범위**: 4개 이상 (schema or computed layer, guidance service, session page UI, background hooks)

---

## 0. 현재 상태 분석

지금 HARP에는 이미 "안내의 재료"는 꽤 많다.

- 준비도 퍼센트
- checklist weight
- recent references
- deliverable section `confidence`
- deliverable section `cited`

하지만 현재 UX는 대부분 reactive다.

예:

- 사용자가 직접 탭을 눌러야 상태를 본다
- 사용자가 직접 low-confidence section을 읽어야 한다
- 사용자가 직접 "뭐가 부족하지?"를 해석해야 한다

즉, **시스템이 먼저 행동을 제안하는 계층은 없다**.

---

## 1. 핵심 설계 결정

### 1.1 MVP는 deterministic guidance부터

처음부터 LLM으로 guidance를 쓰게 하면:

- 설명은 그럴듯해도
- 품질이 흔들리고
- 디버깅이 어렵다

따라서 첫 단계는:

> 규칙 기반 guidance 생성

으로 간다.

LLM은 나중에 문구 다듬기나 summary 기반 통합에 쓰는 것이 맞다.

### 1.2 guidance는 저장한다

대안:

1. 요청 시 실시간 계산
2. guidance item 저장

첫 구현에서도 **저장** 쪽이 낫다.

이유:

- dismiss/resolved 상태 관리 가능
- 동일 경고 반복 노출 방지
- 어떤 guidance가 자주 나오는지 분석 가능

### 1.3 guidance는 "다음 행동"까지 줘야 한다

나쁜 guidance:

- "현황이 부족합니다"

좋은 guidance:

- "현황 근거가 부족합니다. 근거자료를 1개 추가하거나, 현재 상태 수치를 먼저 입력하세요."

즉, title만이 아니라 body + CTA가 필요하다.

---

## 2. 신규 데이터 모델

### 2.1 `session_guidance_items` 테이블

```typescript
type GuidanceKind =
  | 'checklist_gap'
  | 'evidence_gap'
  | 'low_confidence'
  | 'reference_gap'
  | 'summary_gap';

type GuidancePriority = 'high' | 'low' | 'medium';
type GuidanceStatus = 'active' | 'dismissed' | 'resolved';
```

```typescript
const sessionGuidanceItemsTable = pgTable(
  'session_guidance_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),

    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),

    kind: text('kind').$type<GuidanceKind>().notNull(),
    priority: text('priority').$type<GuidancePriority>().default('medium').notNull(),
    status: text('status').$type<GuidanceStatus>().default('active').notNull(),

    dedupeKey: text('dedupe_key').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    ctaLabel: text('cta_label'),
    ctaTarget: text('cta_target'),

    source: jsonb('source').$type<Record<string, unknown>>().default({}).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionIndex: index('idx_session_guidance_items_session_id').on(table.sessionId),
    workspaceIndex: index('idx_session_guidance_items_workspace_id').on(table.workspaceId),
    statusIndex: index('idx_session_guidance_items_status').on(table.status),
    dedupeIndex: index('idx_session_guidance_items_dedupe_key').on(table.dedupeKey),
  }),
);
```

### 2.2 `dedupeKey`가 필요한 이유

예:

- `checklist_gap:evidence`
- `low_confidence:section:시사점`

같은 guidance가 매번 중복 생성되면 UX가 나빠진다.

따라서:

- 같은 의미의 active item은 하나만 유지

규칙이 필요하다.

---

## 3. Guidance 생성 규칙

### 3.1 Checklist Gap

조건:

- high-weight checklist item이 미완료

예:

- `current_state`
- `evidence`

출력 예:

- title: `현황 항목이 비어 있습니다`
- description: `현재 상태를 설명하는 수치나 관찰이 아직 부족합니다. 수치 1개 또는 핵심 현황 문장부터 추가하세요.`
- cta: `인터뷰 계속하기`

### 3.2 Evidence Gap

조건:

- source 개수 0
- 또는 latest deliverable에 `cited=false` section이 다수

출력 예:

- title: `근거자료가 부족합니다`
- description: `초안은 만들어졌지만 근거 연결이 약합니다. 관련 표, 설문 결과, 회의 메모를 추가하면 품질이 올라갑니다.`
- cta: `자료 추가하기`

### 3.3 Low Confidence

조건:

- latest deliverable section 중 `confidence='low'`

출력 예:

- title: `시사점 섹션의 확신도가 낮습니다`
- description: `현재 정보만으로는 시사점을 강하게 쓰기 어렵습니다. 결과 해석 근거를 보강하거나 표현 강도를 낮추는 것이 좋습니다.`
- cta: `초안 검토하기`

### 3.4 Reference Gap

조건:

- 같은 template type의 `recentReferences`가 0

출력 예:

- title: `참고할 과거 보고서가 없습니다`
- description: `이번 유형의 첫 산출물입니다. 이번 초안이 다음부터는 기준점이 됩니다.`
- priority: `low`

### 3.5 Summary Gap

후순위. `feature-hierarchical-summaries.md` 이후 연동.

조건 예:

- session digest 없음
- digest는 있지만 stale

---

## 4. 서비스 구조

### 4.1 신규 파일: `src/lib/guidance/service.ts`

핵심 함수:

```typescript
async function refreshSessionGuidance(sessionId: string, workspaceId: string): Promise<void>
async function listActiveGuidanceForSession(sessionId: string): Promise<SessionGuidanceItem[]>
async function dismissGuidanceItem(guidanceItemId: string): Promise<void>
```

보조 함수:

```typescript
function buildChecklistGapGuidance(...)
function buildEvidenceGapGuidance(...)
function buildLowConfidenceGuidance(...)
function buildReferenceGapGuidance(...)
```

### 4.2 guidance refresh 트리거

아래 이벤트 후 refresh한다.

1. assistant message 저장
2. source 추가
3. deliverable 생성/수정
4. status 승격

즉, guidance는 읽기 시 계산하지 않고 write 이후 갱신한다.

---

## 5. UI 설계

### 5.1 Session canvas 상단 또는 overview 카드

권장:

- top 1~3 guidance item 노출

형태:

```text
[High] 근거자료가 부족합니다
초안은 만들어졌지만 cited 없는 섹션이 많습니다.
[자료 추가하기]
```

### 5.2 색상 체계

| priority | style |
|------|------|
| high | `badge-error`, 강조 카드 |
| medium | `badge-warning` |
| low | `badge-neutral` |

### 5.3 dismiss / resolve

사용자 행동:

- `닫기` -> `dismissed`
- 조건 해소 -> 시스템이 `resolved`

예:

- source 추가 후 `evidence_gap` 해결
- section confidence 개선 후 `low_confidence` 해결

---

## 6. 변경 파일별 스펙

### 6.1 `src/lib/db/schema.ts`

추가:

- `GuidanceKind`
- `GuidancePriority`
- `GuidanceStatus`
- `sessionGuidanceItemsTable`

### 6.2 `src/lib/guidance/service.ts`

신규:

- guidance refresh
- active guidance 조회
- dismiss 처리

### 6.3 `src/lib/sessions/service.ts`

변경 가능:

- source/message 저장 후 guidance refresh enqueue 또는 direct call

### 6.4 `src/lib/deliverables/service.ts`

변경:

- deliverable 생성/수정 후 guidance refresh

### 6.5 `src/components/workspace/session-canvas.tsx`

추가:

- guidance 카드 영역
- dismiss 버튼
- CTA 버튼

---

## 7. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| readiness gauge 자체 로직 | guidance는 그 위의 행동 계층 |
| interview help 패널 | reactive help는 그대로 유지 |
| prompt system | MVP guidance는 deterministic rule 기반 |
| manager-only insight | 이번 범위 아님 |

---

## 8. CLAUDE.md 체크리스트

- [ ] guidance 생성 로직은 모듈 스코프 순수 함수로 분리
- [ ] `any` 사용 금지
- [ ] 동일 의미 guidance 중복 생성 방지
- [ ] dismiss/resolved 상태 전이 명확히 처리
- [ ] UI 액션은 실제 target과 연결
- [ ] `npm run harness:check` 통과
- [ ] `npm run build` 통과

---

## 9. 구현 순서

1. guidance table schema 추가
2. migration 생성
3. guidance rule 함수 구현
4. refreshSessionGuidance 구현
5. deliverable/source/message 저장 흐름에 연결
6. session canvas에 top guidance card 추가
7. dismiss action 추가
8. `harness:check` + `build`

---

## 10. Open Questions

1. guidance refresh를 동기 처리할지 비동기 처리할지
2. dismiss한 guidance를 언제 다시 열지
3. `reference_gap`을 실제로 guidance로 보여줄 가치가 있는지
4. Phase 2에서 LLM이 문구를 더 자연스럽게 rewrite할지

---

## 11. 최종 판단

이 feature의 핵심은 "더 많은 경고를 보여준다"가 아니다.

핵심은:

> 사용자가 스스로 상태를 해석해야 하는 부담을 줄이고, HARP가 다음 행동을 먼저 제안하게 만드는 것

이다.
