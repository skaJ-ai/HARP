# Feature Design: 템플릿 재설계 + 예시 문서 입력

> **문서 목적**: 구현 LLM이 템플릿 4종 재설계 + 예시 문서 입력 기능을 구현하기 위한 설계 스키마.
> **작성일**: 2026-03-30
> **리서치 근거**: HR 보고서 유형 딥리서치 (목적별 분류, SHRM/CIPD 프레임워크, BambooHR/Workday 분류 비교)
> **변경 파일**: 9개 (DB 1, 템플릿 1, 타입/밸리데이터 2, 서비스 1, AI 1, API 1, UI 2) + 마이그레이션 1

---

## 0. 현재 상태 분석

### 템플릿 구조 (templates/index.ts)

```
현재 3종 — 주제 기반(topic-bound)
├── policy_review    "제도 검토 초안"       → 제도 담당자 전용
├── training_summary "교육 운영 결과 요약"   → 교육 담당자 전용
└── weekly_report    "주간 HR 현황 보고"     → 비교적 범용이나 "주간" 고정
```

**문제**:
1. 채용 담당자가 "면접 프로세스 개선안"을 쓰려면 → 맞는 템플릿 없음
2. 보상 담당자가 "성과급 지급 결과"를 정리하려면 → 맞는 템플릿 없음
3. "이직률 원인 분석" 같은 분석 보고서 → 기획도, 결과도, 현황도 아님

### 세션 생성 플로우 (new-session-form.tsx)

```
[현재]
카드 클릭 → 즉시 POST /api/sessions → 세션 생성 → 리다이렉트
```

**문제**: 사용자가 "이런 식으로 써줘"라는 예시를 제공할 수 없음. 같은 "기획안"이라도 부서마다 톤, 분량, 형식이 다른데 이를 반영할 방법이 없다.

### DB 스키마 (schema.ts:L11)

```typescript
type TemplateType = 'policy_review' | 'training_summary' | 'weekly_report';
```

`sessions.template_type`, `deliverables.template_type` 모두 이 타입 사용.

---

## 1. 핵심 설계 결정

### 1.1 템플릿 분류: 주제 기반 → 행동 기반

딥리서치 결과, HR 보고서는 **4가지 행동**으로 분류하면 실무 범위의 ~85%를 커버한다:

| # | 행동 | 시간축 | 핵심 질문 |
|---|------|--------|----------|
| 1 | **기획(안) 작성하기** | → 미래 | "무엇을 할 것인가?" |
| 2 | **분석 보고 작성하기** | 🔍 인사이트 | "왜 이런 결과가 나왔나?" |
| 3 | **결과 보고 정리하기** | ← 과거 | "어떻게 됐나?" |
| 4 | **현황 보고 작성하기** | ● 현재 | "지금 어떤가?" |

**TemplateType 변경**:
```typescript
// Before
type TemplateType = 'policy_review' | 'training_summary' | 'weekly_report';

// After
type TemplateType = 'planning' | 'analysis' | 'result' | 'status';
```

**마이그레이션 매핑**:
| Old | New | 이유 |
|-----|-----|------|
| `policy_review` | `planning` | 제도 검토 = 기획의 하위 유형 |
| `training_summary` | `result` | 교육 결과 = 결과 보고의 하위 유형 |
| `weekly_report` | `status` | 주간 보고 = 현황 보고의 하위 유형 |

### 1.2 카드 UI: 3단 정보 구조 + 컬러 배지

카드 한 장의 정보 계층:

```
┌─────────────────────────────────────────┐
│  기획(안) 작성하기          [→ 미래]     │  ← 카테고리명 + 컬러 배지
│  새로운 걸 제안하거나 검토할 때           │  ← 상황 문장 (언제 쓰나)
│                                         │
│  #복리후생 도입안  #채용 전략 수립        │  ← 예시 태그 (구체적으로 뭘)
│  #제도 개편 검토   #교육 프로그램 설계    │
│                                  10분    │  ← 예상 소요 시간
│  → 이 유형으로 시작                      │
└─────────────────────────────────────────┘
```

**컬러 배지 매핑**:

| 템플릿 | 배지 색상 | 배지 라벨 | CSS 클래스 |
|--------|----------|----------|-----------|
| planning | 파랑(blue) | → 미래 | `badge-blue` |
| analysis | 주황(amber) | 🔍 인사이트 | `badge-amber` |
| result | 초록(green) | ← 과거 | `badge-green` |
| status | 회색(gray) | ● 현재 | `badge-gray` |

배지 색상은 기존 `badge-accent`, `badge-neutral` 등과 별개로 4개 추가.

### 1.3 예시 문서 입력: 세션 생성 2단계 플로우

```
[변경 후]
카드 클릭
  → 카드 선택 상태 + 하단에 예시 입력 영역 노출
    → "건너뛰고 시작" 클릭 → POST /api/sessions (exampleText 없이)
    → "이 예시로 시작" 클릭 → POST /api/sessions (exampleText 포함)
      → 세션 생성 → 리다이렉트
```

**예시 문서의 역할**:
- 인터뷰 시: 톤과 질문 깊이 조절의 참고 자료
- 생성 시: 문체, 분량, 구조의 스타일 레퍼런스
- 기존 "참고 산출물"(HARP 과거 산출물)과는 다름 — 이것은 사용자가 직접 제공하는 외부 스타일 가이드

**분량 제한**:
- `EXAMPLE_TEXT_MAX_LENGTH = 5000` — API 검증용 (약 A4 2~3장)
- `EXAMPLE_TEXT_PROMPT_MAX_LENGTH = 3000` — 프롬프트 포함 시 잘라서 사용

---

## 2. 변경 파일 스펙

### 2.1 `src/lib/db/schema.ts`

#### TemplateType 변경

```typescript
// Before (L11)
type TemplateType = 'policy_review' | 'training_summary' | 'weekly_report';

// After
type TemplateType = 'analysis' | 'planning' | 'result' | 'status';
```

알파벳순 정렬.

#### sessions 테이블에 example_text 컬럼 추가

```typescript
const sessionsTable = pgTable(
  'sessions',
  {
    checklist: jsonb('checklist').$type<SessionChecklist>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    exampleText: text('example_text'),  // NEW — nullable, 선택적 예시 문서
    id: uuid('id').defaultRandom().primaryKey(),
    status: text('status').$type<SessionStatus>().default('in_progress').notNull(),
    templateType: text('template_type').$type<TemplateType>().notNull(),
    title: text('title'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  // ... indexes 동일
);
```

### 2.2 DB 마이그레이션

```sql
-- 1. sessions 테이블에 example_text 컬럼 추가
ALTER TABLE sessions ADD COLUMN example_text TEXT;

-- 2. sessions 테이블 template_type 값 변환
UPDATE sessions SET template_type = 'planning' WHERE template_type = 'policy_review';
UPDATE sessions SET template_type = 'result'   WHERE template_type = 'training_summary';
UPDATE sessions SET template_type = 'status'   WHERE template_type = 'weekly_report';

-- 3. deliverables 테이블 template_type 값 변환
UPDATE deliverables SET template_type = 'planning' WHERE template_type = 'policy_review';
UPDATE deliverables SET template_type = 'result'   WHERE template_type = 'training_summary';
UPDATE deliverables SET template_type = 'status'   WHERE template_type = 'weekly_report';
```

Drizzle의 마이그레이션 도구(`npx drizzle-kit generate` 등)를 사용한다.

### 2.3 `src/lib/templates/index.ts`

#### 타입 추가

```typescript
type TemplateBadgeColor = 'amber' | 'blue' | 'gray' | 'green';

interface TemplateBadge {
  color: TemplateBadgeColor;
  label: string;
}
```

#### TemplateDefinition 인터페이스 변경

```typescript
interface TemplateDefinition {
  badge: TemplateBadge;                    // NEW
  checklist: TemplateChecklistItem[];
  description: string;                     // CHANGED — 상황 문장으로 용도 변경
  estimatedMinutes: number;
  exampleTags: string[];                   // NEW
  methodologyMap: TemplateMethodologyMap;
  name: string;
  sections: TemplateSectionDefinition[];
  starterMessage: string;
  systemPrompt: TemplatePromptSet;
  type: TemplateType;
}
```

`description` 용도 변경: 기존 "긴 설명" → "언제 쓰나" 상황 한 줄.

#### RAW_TEMPLATE_DEFINITIONS 전면 교체

```typescript
const RAW_TEMPLATE_DEFINITIONS: TemplateDefinitionMap = {
  analysis: {
    badge: { color: 'amber', label: '🔍 인사이트' },
    checklist: CHECKLIST_ITEMS,
    description: '데이터를 해석하고 시사점을 뽑을 때',
    estimatedMinutes: 10,
    exampleTags: ['이직 원인 분석', '보상 벤치마크', '만족도 조사 해석', '역량 갭 분석'],
    methodologyMap: {
      analysis: [HR_ANALYTICS, AS_IS_TO_BE],
      structure: [PYRAMID_SCQA],
      validation: [SO_WHAT_WHY_SO],
    },
    name: '분석 보고 작성하기',
    sections: [
      { description: '왜 이 분석이 필요한지 배경을 정리합니다.', name: '분석 배경', required: true },
      { description: '어떤 데이터를 어떻게 분석했는지 정리합니다.', name: '분석 범위와 방법', required: true },
      { description: '핵심 데이터와 발견된 패턴을 정리합니다.', name: '주요 발견', required: true },
      { description: '데이터가 의미하는 것과 시사점을 해석합니다.', name: '해석과 시사점', required: true },
      { description: '분석 결과에 기반한 권고 사항을 제안합니다.', name: '권고 사항', required: true },
      { description: '원본 데이터와 출처를 정리합니다.', name: '근거 자료', required: true },
    ],
    starterMessage: '분석 보고서를 함께 작성하겠습니다. 어떤 주제를 분석하려고 하시나요? 분석 배경부터 알려주세요.',
    type: 'analysis',
  },
  planning: {
    badge: { color: 'blue', label: '→ 미래' },
    checklist: CHECKLIST_ITEMS,
    description: '새로운 걸 제안하거나 검토할 때',
    estimatedMinutes: 10,
    exampleTags: ['복리후생 도입안', '채용 전략 수립', '제도 개편 검토', '교육 프로그램 설계'],
    methodologyMap: {
      analysis: [AS_IS_TO_BE, FORCE_FIELD],
      structure: [PYRAMID_SCQA],
      validation: [MECE],
    },
    name: '기획(안) 작성하기',
    sections: [
      { description: '왜 이 기획이 필요한지 배경을 정리합니다.', name: '배경', required: true },
      { description: '지금 어떤 상태인지 현황을 분석합니다.', name: '현황 분석', required: true },
      { description: '무엇을 제안하는지 구체적으로 정리합니다.', name: '제안 내용', required: true },
      { description: '어떻게, 언제 실행하는지 계획을 세웁니다.', name: '실행 계획', required: true },
      { description: '어떤 결과를 예상하는지 효과를 정리합니다.', name: '기대 효과', required: true },
      { description: '참고 데이터와 출처를 정리합니다.', name: '근거 자료', required: true },
    ],
    starterMessage: '기획(안) 작성을 함께 시작하겠습니다. 어떤 주제의 기획안을 준비하시나요? 배경부터 들려주세요.',
    type: 'planning',
  },
  result: {
    badge: { color: 'green', label: '← 과거' },
    checklist: CHECKLIST_ITEMS,
    description: '한 일의 성과를 정리할 때',
    estimatedMinutes: 8,
    exampleTags: ['교육 결과 보고', '채용 실적 정리', '제도 시행 성과', '행사 결과 요약'],
    methodologyMap: {
      analysis: [LOGIC_MODEL, HR_ANALYTICS],
      structure: [SDS],
      validation: [SO_WHAT_WHY_SO, ACTION_TITLE],
    },
    name: '결과 보고 정리하기',
    sections: [
      { description: '무엇을, 왜, 언제 했는지 기본 정보를 정리합니다.', name: '개요', required: true },
      { description: '어떻게 진행됐는지 과정을 요약합니다.', name: '과정 요약', required: true },
      { description: '핵심 결과와 수치를 정리합니다.', name: '주요 성과', required: true },
      { description: '성과의 의미와 교훈을 해석합니다.', name: '분석과 인사이트', required: true },
      { description: '다음에 개선할 점을 제안합니다.', name: '개선 제안', required: true },
      { description: '데이터와 출처를 정리합니다.', name: '근거 자료', required: true },
    ],
    starterMessage: '결과 보고를 함께 정리하겠습니다. 어떤 활동의 결과를 정리하시나요? 기본 개요부터 들려주세요.',
    type: 'result',
  },
  status: {
    badge: { color: 'gray', label: '● 현재' },
    checklist: CHECKLIST_ITEMS,
    description: '지금 상태를 보고할 때',
    estimatedMinutes: 5,
    exampleTags: ['월간 인력현황', '이직률 보고', '채용 파이프라인', 'HR KPI 현황'],
    methodologyMap: {
      analysis: [HR_ANALYTICS],
      structure: [SDS],
      validation: [ACTION_TITLE],
    },
    name: '현황 보고 작성하기',
    sections: [
      { description: '가장 중요한 이슈와 요약 메시지를 정리합니다.', name: '주요 이슈 요약', required: true },
      { description: '업무 진행 상태와 핵심 경과를 정리합니다.', name: '진행 현황', required: true },
      { description: '핵심 수치와 KPI를 정리합니다.', name: '주요 지표', required: true },
      { description: '다음 기간에 이어갈 계획과 의사결정 포인트를 정리합니다.', name: '향후 계획', required: true },
      { description: '리스크, 지원 요청, 특이사항을 정리합니다.', name: '특이사항', required: true },
    ],
    starterMessage: '현황 보고를 시작하겠습니다. 어떤 영역의 현황을 보고하시나요? 주요 이슈부터 말씀해주세요.',
    type: 'status',
  },
};
```

#### CHECKLIST_ITEMS — 변경 없음

기존 7개 항목(목적, 대상, 현황, 제안, 기대효과, 일정, 근거/데이터)은 4개 템플릿 모두에 범용적으로 적용된다. helpText 예시도 충분히 일반적이므로 유지.

#### METHODOLOGY_LIBRARY — 변경 없음

기존 10개 방법론 카드 유지. 매핑만 변경.

#### buildInterviewPrompt — 예시 문서 활용 규칙 추가

기존 `[모호도 감지 규칙]` 블록 아래에 추가:

```typescript
'[예시 문서 활용 규칙]',
'- 사용자가 예시 문서를 제공한 경우, 해당 문서의 문체와 깊이를 참고해 질문 수준을 조절합니다.',
'- 예시 문서의 내용을 인터뷰에서 직접 인용하지 않습니다.',
'- 예시 문서를 언급할 때는 "제공해 주신 예시를 참고하면..."으로 시작합니다.',
'- 예시 문서가 없어도 인터뷰 진행에 지장이 없도록 합니다.',
```

#### buildGeneratePrompt — 예시 문서 참고 규칙 추가

기존 `[규칙]` 블록 아래에 추가:

```typescript
'[예시 문서 참고]',
'- 사용자가 제공한 예시 문서가 있으면, 해당 문서의 문체, 분량, 구조를 참고해 작성합니다.',
'- 예시 문서의 내용이 아닌 스타일(톤, 깊이, 형식)을 따릅니다.',
'- 예시 문서가 없으면 이 규칙을 무시합니다.',
```

#### export 변경

기존 export에 추가:

```typescript
export type {
  // ... 기존 타입들
  TemplateBadge,
  TemplateBadgeColor,
};
```

### 2.4 `src/lib/sessions/types.ts`

#### SessionTemplateSummary에 새 필드 추가

```typescript
interface SessionTemplateSummary {
  badge: TemplateBadge;              // NEW
  checklist: TemplateChecklistItem[];
  description: string;
  estimatedMinutes: number;
  exampleTags: string[];             // NEW
  methodologyMap: TemplateMethodologyMap;
  name: string;
  sections: TemplateSectionDefinition[];
  type: TemplateType;
}
```

#### CreateSessionRequestBody 변경

```typescript
interface CreateSessionRequestBody {
  exampleText?: string;    // NEW — 선택적 예시 문서
  templateType: TemplateType;
}
```

#### SessionDetail에 exampleText 추가

```typescript
interface SessionDetail extends SessionSummary {
  canGenerate: boolean;
  canvas: SessionCanvasState;
  exampleText: string | null;        // NEW
  latestDeliverable: DeliverableSummary | null;
  messages: SessionChatMessage[];
  readinessPercent: number;
  recentReferences: DeliverableSummary[];
  sources: SessionSourceSummary[];
}
```

### 2.5 `src/lib/sessions/validators.ts`

```typescript
const EXAMPLE_TEXT_MAX_LENGTH = 5000;

const createSessionRequestSchema = z.object({
  exampleText: z
    .string()
    .trim()
    .max(EXAMPLE_TEXT_MAX_LENGTH, `예시 문서는 ${EXAMPLE_TEXT_MAX_LENGTH}자 이내로 입력해 주세요.`)
    .optional(),
  templateType: z.enum(['analysis', 'planning', 'result', 'status']),
});
```

`EXAMPLE_TEXT_MAX_LENGTH`는 named export로 내보낸다 (UI에서 글자 수 표시용).

### 2.6 `src/lib/sessions/service.ts`

#### createSessionForWorkspace 시그니처 변경

```typescript
async function createSessionForWorkspace(
  workspaceId: string,
  templateType: TemplateType,
  exampleText?: string,           // NEW — 선택적 매개변수
): Promise<SessionSummary> {
```

#### insert 값에 exampleText 추가

```typescript
const createdSessions = await transaction
  .insert(sessionsTable)
  .values({
    checklist: createInitialChecklist(templateType),
    exampleText: exampleText ?? null,   // NEW
    templateType,
    title: template.name,
    workspaceId,
  })
  // ...
```

#### createSessionTemplateSummary에 새 필드 추가

```typescript
function createSessionTemplateSummary(templateType: TemplateType): SessionTemplateSummary {
  const template = getTemplateByType(templateType);

  return {
    badge: template.badge,              // NEW
    checklist: template.checklist,
    description: template.description,
    estimatedMinutes: template.estimatedMinutes,
    exampleTags: template.exampleTags,  // NEW
    methodologyMap: template.methodologyMap,
    name: template.name,
    sections: template.sections,
    type: template.type,
  };
}
```

#### getSessionDetailForWorkspace에 exampleText 포함

세션 상세 조회 시 `exampleText` 필드를 포함해 반환한다. 기존 select 목록에 `sessionsTable.exampleText` 추가.

### 2.7 `src/lib/ai/session-chat.ts`

#### BuildInterviewContextOptions에 exampleText 추가

```typescript
interface BuildInterviewContextOptions {
  currentChecklist: SessionChecklist;
  exampleText?: string | null;     // NEW
  recentDeliverables: {
    summary: string;
    title: string;
  }[];
  sources: {
    content: string;
    label: string | null;
    type: string | null;
  }[];
  templateType: TemplateType;
}
```

#### buildInterviewContext에 예시 문서 블록 추가

```typescript
const EXAMPLE_TEXT_PROMPT_MAX_LENGTH = 3000;

function buildInterviewContext({
  currentChecklist,
  exampleText,
  recentDeliverables,
  sources,
  templateType,
}: BuildInterviewContextOptions): string {
  // ... 기존 로직 동일 ...

  const exampleContext = exampleText
    ? exampleText.length > EXAMPLE_TEXT_PROMPT_MAX_LENGTH
      ? `${exampleText.slice(0, EXAMPLE_TEXT_PROMPT_MAX_LENGTH)}...`
      : exampleText
    : null;

  return [
    template.systemPrompt.interview,
    '',
    '[현재 체크리스트 상태]',
    checklistState,
    '',
    '[현재 세션 근거자료]',
    sourceContext,
    '',
    '[같은 유형의 이전 산출물 요약]',
    deliverableContext,
    '',
    // NEW — 예시 문서 블록
    ...(exampleContext
      ? [
          '[사용자 제공 예시 문서]',
          '아래는 사용자가 참고용으로 제공한 예시 문서입니다. 이 문서의 문체, 분량, 구조를 스타일 레퍼런스로 사용합니다.',
          exampleContext,
        ]
      : []),
  ].join('\n');
}
```

#### 생성 프롬프트에도 예시 문서 반영

생성 API(`/api/sessions/[id]/generate/route.ts`)가 시스템 프롬프트를 구성할 때, `exampleText`가 있으면 `buildGeneratePrompt` 결과 뒤에 예시 문서 블록을 추가한다. 구체적인 삽입 지점은 생성 라우트의 기존 구조에 따라 결정한다.

```typescript
// 생성 라우트 내에서 (구현 LLM이 정확한 위치 판단)
const exampleBlock = session.exampleText
  ? `\n\n[사용자 제공 예시 문서 — 스타일 참고]\n${session.exampleText.slice(0, EXAMPLE_TEXT_PROMPT_MAX_LENGTH)}`
  : '';

const systemPrompt = template.systemPrompt.generate + exampleBlock;
```

`EXAMPLE_TEXT_PROMPT_MAX_LENGTH`는 `session-chat.ts`에서 export하거나, 별도 상수 파일에서 공유한다.

### 2.8 `src/app/api/sessions/route.ts`

#### POST 핸들러에 exampleText 전달

```typescript
const session = await createSessionForWorkspace(
  currentUser.workspaceId,
  parsedRequest.data.templateType,
  parsedRequest.data.exampleText,    // NEW
);
```

### 2.9 `src/components/workspace/new-session-form.tsx`

이 파일의 변경이 가장 크다. 카드 디자인 + 2단계 플로우 모두 여기서 구현.

#### 상수 추가

```typescript
const BADGE_COLOR_CLASS_MAP: Record<string, string> = {
  amber: 'badge-amber',
  blue: 'badge-blue',
  gray: 'badge-gray',
  green: 'badge-green',
} as const;
```

#### 상태 변경

```typescript
// Before
const [selectedTemplateType, setSelectedTemplateType] = useState<string | null>(null);

// After
const [errorMessage, setErrorMessage] = useState('');
const [exampleText, setExampleText] = useState('');
const [isCreating, setIsCreating] = useState(false);
const [selectedTemplateType, setSelectedTemplateType] = useState<string | null>(null);
```

#### 핸들러 변경

```typescript
// 카드 클릭 → 템플릿 선택 (세션 생성하지 않음)
const handleTemplateSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
  const templateType = event.currentTarget.dataset.templateType;
  if (!templateType) return;

  setSelectedTemplateType(templateType);
  setExampleText('');
  setErrorMessage('');
};

// 예시 입력 영역에서 "다른 유형 선택" → 선택 초기화
const handleTemplateDeselect = () => {
  setSelectedTemplateType(null);
  setExampleText('');
  setErrorMessage('');
};

// 예시 textarea 변경
const handleExampleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  setExampleText(event.target.value);
};

// 공통 세션 생성 로직
const handleSessionCreate = async (includeExample: boolean) => {
  if (!selectedTemplateType) return;

  setIsCreating(true);
  setErrorMessage('');

  const body: Record<string, string> = { templateType: selectedTemplateType };
  if (includeExample && exampleText.trim().length > 0) {
    body.exampleText = exampleText.trim();
  }

  const result = await safeFetch<CreateSessionResponse>('/api/sessions', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

  if (!result.success) {
    setIsCreating(false);
    setErrorMessage(result.error);
    return;
  }

  router.push(`/workspace/session/${result.data.data.session.id}`);
};

// "건너뛰고 시작" 버튼
const handleExampleSkip = () => {
  void handleSessionCreate(false);
};

// "이 예시로 시작" 버튼
const handleExampleConfirm = () => {
  void handleSessionCreate(true);
};
```

#### JSX 구조

```tsx
<section className="surface flex flex-col gap-6 p-8 shadow-[var(--shadow-2)]">
  <div className="flex flex-col gap-2">
    <span className="section-label">New Session</span>
    <h1 className="text-3xl font-bold text-[var(--color-text)]">어떤 작업을 하시나요?</h1>
    <p className="text-sm text-[var(--color-text-secondary)]">
      유형을 고르면 HARP가 먼저 질문을 시작하고, 인터뷰 캔버스와 문서 초안이 함께 열립니다.
    </p>
  </div>

  {errorMessage.length > 0 ? (
    <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
      {errorMessage}
    </div>
  ) : null}

  {/* 카드 그리드 — 4개 카드, 2x2 레이아웃 */}
  <div className="grid gap-4 lg:grid-cols-2">
    {templates.map((template) => {
      const isSelected = selectedTemplateType === template.type;
      const isDisabled = selectedTemplateType !== null && !isSelected;

      return (
        <button
          className={`surface-interactive flex h-full flex-col items-start gap-3 p-6 text-left ${isSelected ? 'ring-2 ring-[var(--color-accent)]' : ''} ${isDisabled ? 'opacity-40' : ''}`}
          data-template-type={template.type}
          disabled={isDisabled || isCreating}
          key={template.type}
          onClick={handleTemplateSelect}
          type="button"
        >
          <div className="flex w-full items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {template.name}
            </h2>
            <span className={`badge ${BADGE_COLOR_CLASS_MAP[template.badge.color]}`}>
              {template.badge.label}
            </span>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)]">
            {template.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {template.exampleTags.map((tag) => (
              <span
                className="rounded-full bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex w-full items-center justify-between pt-2">
            <span className="text-sm font-medium text-[var(--color-accent)]">
              {isSelected ? '선택됨' : '이 유형으로 시작'}
            </span>
            <span className="badge badge-neutral">{template.estimatedMinutes}분</span>
          </div>
        </button>
      );
    })}
  </div>

  {/* 예시 문서 입력 영역 — 템플릿 선택 후에만 노출 */}
  {selectedTemplateType !== null ? (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            참고할 예시 문서가 있나요?
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            이전에 쓰셨던 비슷한 보고서를 붙여넣으시면 스타일을 맞춰드립니다. 없으면 건너뛰셔도 됩니다.
          </p>
        </div>
        <button
          className="text-sm text-[var(--color-text-secondary)] underline"
          onClick={handleTemplateDeselect}
          type="button"
        >
          다른 유형 선택
        </button>
      </div>

      <textarea
        className="mb-4 min-h-[160px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
        disabled={isCreating}
        onChange={handleExampleTextChange}
        placeholder="예시 보고서 텍스트를 붙여넣어 주세요..."
        value={exampleText}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-tertiary)]">
          {exampleText.length.toLocaleString()}자
        </span>
        <div className="flex items-center gap-3">
          <button
            className="btn-secondary"
            disabled={isCreating}
            onClick={handleExampleSkip}
            type="button"
          >
            건너뛰고 시작
          </button>
          <button
            className="btn-teal focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCreating || exampleText.trim().length === 0}
            onClick={handleExampleConfirm}
            type="button"
          >
            {isCreating ? '생성 중...' : '이 예시로 시작'}
          </button>
        </div>
      </div>
    </div>
  ) : null}
</section>
```

**중요 변경점**:
- 그리드 `lg:grid-cols-3` → `lg:grid-cols-2` (4개 카드는 2x2가 적합)
- 카드 클릭은 선택만, 세션 생성은 예시 단계에서
- 선택된 카드에 `ring-2` 강조, 나머지 `opacity-40` 비활성화
- `template.type` 배지 제거 → 컬러 배지로 교체

### 2.10 `src/app/workspace/new/page.tsx`

#### 템플릿 데이터에 새 필드 포함

```typescript
const templates = getTemplateCatalog().map((template) => ({
  badge: template.badge,                // NEW
  checklist: template.checklist,
  description: template.description,
  estimatedMinutes: template.estimatedMinutes,
  exampleTags: template.exampleTags,    // NEW
  methodologyMap: template.methodologyMap,
  name: template.name,
  sections: template.sections,
  type: template.type,
}));
```

#### 배지 텍스트 변경

```tsx
<span className="badge badge-accent">표준 템플릿 4종</span>
```

---

## 3. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| CHECKLIST_ITEMS 7개 항목 | 4개 템플릿 모두에 범용 적용 가능 |
| METHODOLOGY_LIBRARY 10개 카드 | 카드 자체는 변경 없음, 매핑만 변경 |
| 메시지 테이블 구조 | 변경 없음 |
| 소스 테이블 구조 | 변경 없음 |
| 산출물 테이블 구조 | `template_type` 값만 마이그레이션, 구조 변경 없음 |
| 세션 캔버스 구조 | `SessionCanvasState`, `SessionCanvasSection` 변경 없음 |
| 인터뷰 메타데이터 파싱 | `parseAssistantMetadata`, `createMetadataCommentTransform` 변경 없음 |
| 캔버스 병합 로직 | `mergeCanvasState` 변경 없음 |
| 아웃라인 프리뷰 기능 | 독립 기능, 영향 없음 |
| 체크리스트 도움말 기능 | 독립 기능, 영향 없음 |

---

## 4. CSS 추가: 배지 컬러 클래스

기존 배지 클래스(`badge-accent`, `badge-neutral`, `badge-success`, `badge-warning`) 외에 4개 추가:

```css
.badge-blue {
  background-color: var(--color-blue-light, #eff6ff);
  color: var(--color-blue, #2563eb);
}
.badge-amber {
  background-color: var(--color-amber-light, #fffbeb);
  color: var(--color-amber, #d97706);
}
.badge-green {
  background-color: var(--color-green-light, #f0fdf4);
  color: var(--color-green, #16a34a);
}
.badge-gray {
  background-color: var(--color-gray-light, #f9fafb);
  color: var(--color-gray, #6b7280);
}
```

CSS 변수가 이미 정의되어 있으면 사용하고, 없으면 fallback 값 사용. 구현 LLM이 기존 디자인 토큰 체계에 맞춰 조정한다.

---

## 5. CLAUDE.md 체크리스트

- [ ] `TemplateType` 알파벳순: `'analysis' | 'planning' | 'result' | 'status'`
- [ ] `TemplateBadge`, `TemplateBadgeColor` 타입 named export
- [ ] `EXAMPLE_TEXT_MAX_LENGTH`, `EXAMPLE_TEXT_PROMPT_MAX_LENGTH` 상수 SCREAMING_SNAKE_CASE
- [ ] `RAW_TEMPLATE_DEFINITIONS` 키 알파벳순: analysis → planning → result → status
- [ ] `BADGE_COLOR_CLASS_MAP` 키 알파벳순
- [ ] 핸들러 알파벳순: `handleExampleConfirm`, `handleExampleSkip`, `handleExampleTextChange`, `handleSessionCreate`, `handleTemplateDeselect`, `handleTemplateSelect`
- [ ] JSX 내 인라인 익명 함수 없음
- [ ] `exampleText` 상태는 기존 state 선언과 알파벳순
- [ ] DB 마이그레이션: 기존 데이터 template_type 값 변환 확인
- [ ] `npm run harness:check` 통과
- [ ] `npm run build` 통과

---

## 6. 구현 순서

1. `schema.ts` — `TemplateType` 변경 + `exampleText` 컬럼 추가
2. DB 마이그레이션 파일 생성 및 실행
3. `templates/index.ts` — 타입 추가 + `TemplateDefinition` 변경 + `RAW_TEMPLATE_DEFINITIONS` 전면 교체 + 프롬프트 규칙 추가
4. `sessions/types.ts` — `SessionTemplateSummary`, `CreateSessionRequestBody`, `SessionDetail` 변경
5. `sessions/validators.ts` — 스키마 변경 + `EXAMPLE_TEXT_MAX_LENGTH` 상수
6. `sessions/service.ts` — `createSessionForWorkspace` 시그니처 변경 + 템플릿 요약 함수 변경 + 세션 상세 조회 변경
7. `ai/session-chat.ts` — `BuildInterviewContextOptions` 변경 + 예시 문서 블록 추가 + 상수 추가
8. `api/sessions/route.ts` — `exampleText` 전달
9. `workspace/new-session-form.tsx` — 카드 UI 재설계 + 2단계 플로우 구현
10. `workspace/new/page.tsx` — 템플릿 데이터 필드 추가 + 배지 텍스트 변경
11. CSS — 배지 컬러 클래스 4개 추가
12. `npm run harness:check && npm run build`

---

## 7. 검증 방법

### 7.1 카드 UI
1. `/workspace/new` 페이지에 4개 카드가 2x2 그리드로 표시되는지 확인
2. 각 카드에 **카테고리명 + 상황 문장 + 예시 태그 + 컬러 배지 + 소요 시간**이 모두 표시되는지 확인
3. 컬러 배지 색상이 4종 모두 구분되는지 확인

### 7.2 예시 문서 입력
4. 카드 클릭 → 예시 입력 영역이 하단에 나타나는지 확인
5. "다른 유형 선택" 클릭 → 선택 초기화되는지 확인
6. "건너뛰고 시작" → 세션 생성 + 리다이렉트 확인 (`exampleText` 없이)
7. 텍스트 입력 후 "이 예시로 시작" → 세션 생성 + 리다이렉트 확인 (`exampleText` 포함)
8. 텍스트 미입력 시 "이 예시로 시작" 버튼 비활성화 확인
9. 글자 수 카운터 표시 확인

### 7.3 인터뷰 연동
10. 예시 문서 포함 세션에서 인터뷰 시작 시, LLM이 예시 스타일을 참고하는지 확인
11. 예시 문서 없는 세션에서 인터뷰가 정상 진행되는지 확인

### 7.4 생성 연동
12. 예시 문서 포함 세션에서 "정리하기" → 생성 결과가 예시 스타일을 반영하는지 확인

### 7.5 마이그레이션
13. 기존 `policy_review` 세션이 `planning`으로 변환되어 정상 표시되는지 확인
14. 기존 산출물의 `template_type`이 정상 변환되었는지 확인

---

## 8. 연관 설계 문서 영향

| 문서 | 영향 |
|------|------|
| `docs/feature-landing-simplify.md` | `TEMPLATE_PREVIEWS` 상수의 type/name/description이 변경됨. 구현 시 이 문서의 값 대신 새 템플릿 정의를 따른다. |
| `docs/feature-outline-preview.md` | 영향 없음. 프리뷰 로직은 템플릿 타입과 무관. |
| `docs/feature-interview-help.md` | 영향 없음. 체크리스트 helpText 구조 변경 없음. |

---

## 9. 향후 확장 가능성 (이번 스코프 아님)

| 확장 | 설명 |
|------|------|
| 템플릿별 체크리스트 분화 | 현황 보고는 "제안" 항목 가중치를 낮추는 등 맞춤 체크리스트 |
| HR 기능 태그 2차 필터 | 카드 선택 후 "#채용 #교육 #보상" 태그로 세부 분야 지정 |
| 예시 문서 라이브러리 | 자주 쓰는 예시를 저장해두고 재사용 |
| 커뮤니케이션 문서 카테고리 | 공지, 안내문 등 비보고서 산출물 (5번째 카테고리) |
| 예시 문서 파일 업로드 | 텍스트 붙여넣기 외에 .docx, .pdf 업로드 지원 |
