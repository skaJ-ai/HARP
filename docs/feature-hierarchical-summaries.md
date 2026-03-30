# Feature Design: Hierarchical Summaries

> **문서 목적**: 구현 LLM이 HARP에 계층적 요약 구조를 추가하기 위한 설계 문서.
> **작성일**: 2026-03-30
> **상위 문서**: `docs/product-borrowing-from-pllm.md`, `docs/db_engineering.md`
> **변경 파일 예상 범위**: 5개 이상 (schema, sessions/deliverables hooks, summary service, worker/cron, UI read path)

---

## 0. 현재 상태 분석

현재 HARP에는 아래는 있다.

- 원문 대화(`messages`)
- 원문 자료(`sources`)
- 산출물(`deliverables`)
- 최신 산출물 preview
- 최근 동일 유형 산출물 3건 참조

하지만 아래는 없다.

- 세션 수준의 지속 요약
- 템플릿 수준의 주간 누적 요약
- 관리자용 집계 요약

즉, 지금 구조는 **기록은 저장하지만 압축 계층은 없다**.

이 상태의 한계:

1. 오래된 세션일수록 원문 재사용 비용이 커진다
2. retrieval이 raw text에 과도하게 의존한다
3. "이 세션이 무엇을 결정했고 무엇이 남았는가"를 빠르게 말하기 어렵다

---

## 1. 핵심 설계 결정

### 1.1 요약은 원문을 대체하지 않는다

원칙:

- 원문은 그대로 남긴다
- summary는 별도 artifact로 추가한다

즉, hierarchical summaries는:

- transcript를 지우는 기능이 아니라
- transcript 위에 압축 레이어를 얹는 기능이다

### 1.2 요약 레벨은 두 단계부터 시작

초기 MVP:

1. **Session Digest**
2. **Template Weekly Rollup**

후순위:

3. Workspace Rollup
4. Leader Summary

처음부터 4단계로 가면 과하다.

### 1.3 세션 요약은 raw source + raw messages + latest deliverable을 함께 본다

세션 요약의 목적은 단순 대화 요약이 아니다.

포함 대상:

- 최근 대화
- 현재 checklist 상태
- source enrichment 결과
- latest deliverable

즉, session digest는 "대화 요약"이 아니라 "세션 상태 요약"이어야 한다.

---

## 2. 신규 데이터 모델

### 2.1 `session_digests` 테이블

```typescript
type SessionDigestStatus = 'failed' | 'pending' | 'ready';
```

```typescript
const sessionDigestsTable = pgTable(
  'session_digests',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' })
      .unique(),

    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),

    templateType: text('template_type').$type<TemplateType>().notNull(),
    status: text('status').$type<SessionDigestStatus>().default('pending').notNull(),

    summaryMarkdown: text('summary_markdown'),
    keyPoints: jsonb('key_points').$type<string[]>().default([]).notNull(),
    openQuestions: jsonb('open_questions').$type<string[]>().default([]).notNull(),
    evidenceGaps: jsonb('evidence_gaps').$type<string[]>().default([]).notNull(),
    recommendedNextActions: jsonb('recommended_next_actions').$type<string[]>().default([]).notNull(),

    model: text('model'),
    version: integer('version').default(1).notNull(),
    lastError: text('last_error'),
    summarizedAt: timestamp('summarized_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    workspaceIndex: index('idx_session_digests_workspace_id').on(table.workspaceId),
    templateIndex: index('idx_session_digests_template_type').on(table.templateType),
    statusIndex: index('idx_session_digests_status').on(table.status),
  }),
);
```

### 2.2 `template_weekly_rollups` 테이블

```typescript
type TemplateRollupStatus = 'failed' | 'pending' | 'ready';
type RollupPeriodType = 'weekly';
```

```typescript
const templateWeeklyRollupsTable = pgTable(
  'template_weekly_rollups',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),

    templateType: text('template_type').$type<TemplateType>().notNull(),
    periodType: text('period_type').$type<RollupPeriodType>().default('weekly').notNull(),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),

    status: text('status').$type<TemplateRollupStatus>().default('pending').notNull(),

    summaryMarkdown: text('summary_markdown'),
    highlights: jsonb('highlights').$type<string[]>().default([]).notNull(),
    repeatedRisks: jsonb('repeated_risks').$type<string[]>().default([]).notNull(),
    relatedSessionIds: jsonb('related_session_ids').$type<string[]>().default([]).notNull(),

    model: text('model'),
    version: integer('version').default(1).notNull(),
    lastError: text('last_error'),
    summarizedAt: timestamp('summarized_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    workspaceIndex: index('idx_template_rollups_workspace_id').on(table.workspaceId),
    templateIndex: index('idx_template_rollups_template_type').on(table.templateType),
    periodIndex: index('idx_template_rollups_period').on(table.periodStart, table.periodEnd),
    statusIndex: index('idx_template_rollups_status').on(table.status),
  }),
);
```

---

## 3. 생성 규칙

### 3.1 Session Digest

생성 입력:

- 대화 기록
- source enrichment
- latest deliverable
- checklist 상태
- readinessPercent

생성 출력:

- 이번 세션의 핵심 요약
- 결정된 내용
- 아직 비어 있는 근거
- 다음 행동 제안

핵심은 "요약"보다 "현재 상태를 압축한 operational memory"다.

### 3.2 Weekly Rollup

입력:

- 같은 workspace
- 같은 template type
- 해당 주간의 ready session digests

출력:

- 자주 반복된 이슈
- 반복되는 근거 부족 패턴
- 템플릿별 주요 변화

즉, raw messages를 다시 읽지 않고 session digest를 입력으로 써서 한 단계 압축한다.

---

## 4. stale / refresh 규칙

### 4.1 session digest를 stale로 만드는 이벤트

아래 중 하나가 일어나면 `session_digests.status = pending`으로 되돌린다.

1. user message 추가
2. assistant message 추가
3. source 추가
4. source enrichment ready로 변경
5. deliverable draft/final/promoted_asset 변경

### 4.2 weekly rollup을 stale로 만드는 이벤트

아래 중 하나가 일어나면 해당 주간 rollup을 pending 처리한다.

1. session digest가 ready로 갱신됨
2. session digest 내용이 변경됨

---

## 5. 서비스 구조

### 5.1 신규 파일: `src/lib/summaries/session.ts`

핵심 함수:

```typescript
async function enqueueSessionDigest(sessionId: string): Promise<void>
async function runPendingSessionDigestBatch(limit: number): Promise<number>
async function buildSessionDigestInput(sessionId: string): Promise<...>
async function summarizeSessionDigest(sessionId: string): Promise<void>
```

### 5.2 신규 파일: `src/lib/summaries/rollup.ts`

핵심 함수:

```typescript
async function enqueueTemplateWeeklyRollup(params: {
  periodEnd: string;
  periodStart: string;
  templateType: TemplateType;
  workspaceId: string;
}): Promise<void>

async function runPendingTemplateWeeklyRollupBatch(limit: number): Promise<number>
```

### 5.3 훅 연결

변경 후보:

- `createUserMessageForSession`
- `createAssistantMessageForSession`
- `createSourceForSession`
- `updateDeliverableForWorkspace`

이 함수들에서:

- 직접 요약을 돌리지 않고
- `pending` 마킹만 한다

즉, write latency와 summary generation latency를 분리한다.

---

## 6. UI / 활용 방식

### 6.1 session page

추가 가능 영역:

- "이번 세션 요약"
- "열린 질문"
- "다음 액션"

즉, session digest를 사람이 바로 읽을 수 있어야 한다.

### 6.2 generation prompt

후순위지만 매우 중요:

- 오래된 raw messages 전체 대신
- `session digest.summaryMarkdown`

를 먼저 참조할 수 있다.

즉, long-context pressure를 줄이는 데 직접 도움이 된다.

### 6.3 manager/leader 기능의 전 단계

template weekly rollup은 훗날:

- leader-only aggregate summary
- cross-project pattern analysis

의 안전한 기반이 된다.

이유:

- raw data 대신 digest/rollup 기반으로 확장할 수 있기 때문

---

## 7. 변경 파일별 스펙

### 7.1 `src/lib/db/schema.ts`

추가:

- `SessionDigestStatus`
- `TemplateRollupStatus`
- `sessionDigestsTable`
- `templateWeeklyRollupsTable`

### 7.2 `src/lib/sessions/service.ts`

변경:

- message/source 저장 후 session digest pending 처리

### 7.3 `src/lib/deliverables/service.ts`

변경:

- deliverable 생성/수정 후 session digest pending 처리

### 7.4 `src/lib/summaries/session.ts`

신규:

- session digest input builder
- summarizer
- batch runner

### 7.5 `src/lib/summaries/rollup.ts`

신규:

- weekly rollup input builder
- rollup summarizer
- batch runner

---

## 8. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| raw messages 저장 방식 | 원문은 계속 필요 |
| raw sources 저장 방식 | source-of-truth 유지 |
| current context tiering | summaries는 추가 레이어이지 기존 기능 대체가 아님 |
| cross-workspace summary | 이번 범위 아님 |

---

## 9. CLAUDE.md 체크리스트

- [ ] 원문 데이터는 삭제/축약하지 않는다
- [ ] summary artifacts는 additive layer로만 추가
- [ ] service 함수는 모듈 스코프 순수 함수로 분리
- [ ] `any` 사용 금지
- [ ] pending/ready/failed 상태 전이 명확히 처리
- [ ] `npm run harness:check` 통과
- [ ] `npm run build` 통과

---

## 10. 구현 순서

1. summary tables schema 추가
2. migration 생성
3. session digest enqueue 연결
4. session digest summarizer 구현
5. weekly rollup enqueue/runner 구현
6. session page read path 추가
7. 이후 generation prompt 최적화 연결
8. `harness:check` + `build`

---

## 11. Open Questions

1. session digest를 source/message 변경 때마다 즉시 재생성할지, 배치 only로 갈지
2. weekly rollup 주기를 정확히 주간으로만 고정할지
3. rollup에 quantitative stats를 넣을지
4. generation prompt에서 summaries를 어느 시점부터 raw 대신 우선할지

---

## 12. 최종 판단

이 feature의 핵심은 "요약본을 하나 더 만든다"가 아니다.

핵심은:

> 쌓이는 기록을 다시 읽을 수 있는 operational memory 계층으로 압축하는 것

이다.
