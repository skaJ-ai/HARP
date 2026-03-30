# Feature Design: 인터뷰 도움말 + 모호도 감지

> **문서 목적**: 구현 LLM이 인터뷰 도움말과 모호도 감지를 구현하기 위한 설계 스키마.
> **작성일**: 2026-03-30
> **리서치 근거**: Typeform Formless 대화형 폼 패턴 + Stanford Legal Aid Intake AI 구조적 후속질문
> **변경 파일**: 2개 (템플릿 정의 1, 캔버스 UI 1)

---

## 0. 현재 상태 분석

### 체크리스트 아이템 구조 (templates/index.ts:11-16)

```typescript
interface TemplateChecklistItem {
  id: string;
  intent: string;   // "이 문서를 왜 작성하는지 명확히 한다." — 짧은 설명
  label: string;     // "목적" — 한 단어 라벨
  weight: number;    // 1-3
}
```

### 인터뷰 프롬프트 (templates/index.ts:273-321)

현재 `buildInterviewPrompt`에 포함된 체크리스트 가이드:
```
- 1. 목적 (가중치 2) — 이 문서를 왜 작성하는지 명확히 한다.
```

현재 모호도 관련 지시:
```
'근거가 부족하면 단정하지 말고, 필요한 자료를 다시 요청합니다.'
```
→ 이 지시는 **근거자료**에만 해당. **사용자 답변의 모호성**에 대한 지시는 없음.

### 캔버스 UI — 체크리스트 표시 (session-canvas.tsx:669-696)

각 체크리스트 아이템은 `label` + `intent` + weight dots를 보여줌.
→ 사용자가 "이 항목이 뭔지 모르겠다"고 느낄 때 도움받을 방법 없음.

---

## 1. 핵심 설계 결정

### 1.1 두 가지 독립 변경

| 변경 | 대상 | 방식 |
|------|------|------|
| **A. 도움말** | 체크리스트 아이템 + 캔버스 UI | 데이터 필드 추가 + UI 확장 |
| **B. 모호도 감지** | 인터뷰 시스템 프롬프트 | 프롬프트 엔지니어링만 |

두 변경은 독립적이다. A만 해도 가치 있고, B만 해도 가치 있다.

### 1.2 왜 이 두 가지를 묶는가

사용자가 "이 항목이 뭔지 몰라서" 모호하게 답하는 경우가 대다수.
도움말이 있으면 모호한 답변 자체가 줄고, 모호도 감지가 나머지를 잡는다.

---

## 2. 변경 A: 체크리스트 도움말

### 2.1 `src/lib/templates/index.ts`

#### 타입 변경 (L11-16)

**현재**:
```typescript
interface TemplateChecklistItem {
  id: string;
  intent: string;
  label: string;
  weight: number;
}
```

**변경**:
```typescript
interface TemplateChecklistItem {
  helpText: string;
  id: string;
  intent: string;
  label: string;
  weight: number;
}
```

`helpText`는 사용자가 "이 항목이 뭔지 모르겠어"할 때 보여줄 실용적 안내문.
`intent`보다 길고, 예시를 포함한다.

#### 데이터 변경 (L50-63)

**현재**:
```typescript
const CHECKLIST_ITEMS: TemplateChecklistItem[] = [
  { id: '1', intent: '이 문서를 왜 작성하는지 명확히 한다.', label: '목적', weight: 2 },
  // ...
];
```

**변경**:
```typescript
const CHECKLIST_ITEMS: TemplateChecklistItem[] = [
  {
    helpText: '"신임 리더십 교육 성과를 정리해서 내년 예산 확보에 쓰려고 합니다"처럼, 이 보고서가 어디에 쓰이는지 말씀해 주세요.',
    id: '1',
    intent: '이 문서를 왜 작성하는지 명확히 한다.',
    label: '목적',
    weight: 2,
  },
  {
    helpText: '"팀장 이상 리더에게 보고합니다" 또는 "경영진 보고용"처럼, 누가 이 문서를 읽을지 알려주세요.',
    id: '2',
    intent: '누구를 위한 보고서인지와 독자를 분명히 한다.',
    label: '대상',
    weight: 1,
  },
  {
    helpText: '"현재 퇴사율이 8%이고 작년 대비 2%p 올랐습니다"처럼, 숫자나 사실을 중심으로 현재 상황을 설명해 주세요.',
    id: '3',
    intent: '현재 상황과 주요 사실을 구조화한다.',
    label: '현황',
    weight: 3,
  },
  {
    helpText: '"온보딩 기간을 2주에서 1주로 줄이는 것을 제안합니다"처럼, 바꾸고 싶은 것이나 시도해볼 방향을 말씀해 주세요.',
    id: '4',
    intent: '제안, 시사점, 개선안의 방향을 정리한다.',
    label: '제안',
    weight: 2,
  },
  {
    helpText: '"비용 15% 절감이 기대됩니다" 또는 "만족도 4.5 이상 유지가 목표입니다"처럼, 숫자나 결과 중심으로 말씀해 주세요.',
    id: '5',
    intent: '기대효과와 의미를 숫자나 결과 중심으로 정리한다.',
    label: '기대효과',
    weight: 2,
  },
  {
    helpText: '"4월 첫째 주까지 완료하고 다음 분기에 재평가합니다"처럼, 언제까지 무엇을 할지 알려주세요.',
    id: '6',
    intent: '일정과 후속 조치를 분명히 한다.',
    label: '일정',
    weight: 1,
  },
  {
    helpText: '설문 결과, 인사 데이터, 벤치마크 자료 등이 있으면 근거자료 패널에 붙여넣어 주세요. 없으면 "근거 자료가 없습니다"라고 말씀해 주셔도 됩니다.',
    id: '7',
    intent: '근거 자료와 데이터 유무를 확인한다.',
    label: '근거/데이터',
    weight: 3,
  },
];
```

#### export 변경 (L397-404)

변경 없음. `TemplateChecklistItem`은 이미 export되고 있으므로 `helpText` 필드가 자동 포함된다.

### 2.2 `src/components/workspace/session-canvas.tsx`

#### 상태 추가

```typescript
const [expandedHelpItemId, setExpandedHelpItemId] = useState<string | null>(null);
```

#### 핸들러 추가

```typescript
const handleChecklistHelpToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
  const itemId = event.currentTarget.dataset.itemId;

  if (!itemId) {
    return;
  }

  setExpandedHelpItemId((previousId) => (previousId === itemId ? null : itemId));
};

const handleChecklistAskClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  const itemLabel = event.currentTarget.dataset.itemLabel;

  if (!itemLabel) {
    return;
  }

  setChatInput(`"${itemLabel}" 항목이 정확히 뭘 말하는 건지 설명해 주세요.`);
};
```

#### 체크리스트 아이템 렌더링 변경 (L668-696)

**현재**: 각 아이템은 badge + label + intent + weight dots만 표시.

**변경**: 아이템 영역을 클릭하면 helpText가 토글되는 구조 추가.

```tsx
{currentSession.template.checklist.map((item) => {
  const isChecked = currentSession.checklist[item.id] === true;
  const isHelpExpanded = expandedHelpItemId === item.id;

  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]"
      key={item.id}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <span
          className={`badge mt-0.5 ${isChecked ? 'badge-success' : 'badge-neutral'}`}
        >
          {isChecked ? '완료' : '대기'}
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {item.label}
          </p>
          <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
            {item.intent}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderChecklistWeightDots(item.weight, isChecked)}
          </div>
          <button
            className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition"
            data-item-id={item.id}
            onClick={handleChecklistHelpToggle}
            type="button"
          >
            {isHelpExpanded ? '접기' : '도움말'}
          </button>
        </div>
      </div>
      {isHelpExpanded ? (
        <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-sunken)] px-4 py-3">
          <p className="mb-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {item.helpText}
          </p>
          <button
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
            data-item-label={item.label}
            onClick={handleChecklistAskClick}
            type="button"
          >
            이 항목에 대해 HARP에게 물어보기
          </button>
        </div>
      ) : null}
    </div>
  );
})}
```

핵심 변경점:
1. 기존 `<div>` 하나가 → `<div>` 안에 본체 + 접히는 help 패널로 분리
2. "도움말" 토글 버튼 추가 (weight dots 옆)
3. 펼치면 `helpText` + "HARP에게 물어보기" 링크 표시
4. "HARP에게 물어보기" 클릭 시 chat input에 질문 프리필

---

## 3. 변경 B: 모호도 감지 (프롬프트 엔지니어링)

### 3.1 `src/lib/templates/index.ts` — `buildInterviewPrompt` 함수 수정

**현재** (L290-321): 인터뷰 규칙에 모호도 관련 지시가 `'근거가 부족하면 단정하지 말고, 필요한 자료를 다시 요청합니다.'` 한 줄뿐.

**변경**: 아래 규칙 블록을 `[출력 규칙]` 바로 앞에 추가.

```typescript
// buildInterviewPrompt 내부, '[출력 규칙]' 바로 앞에 삽입
'',
'[모호도 감지 규칙]',
'- 사용자 답변이 아래 패턴에 해당하면 "모호한 답변"으로 판단하고, 구체화를 요청합니다:',
'  1. 형용사만 있는 답변: "잘 됐어요", "괜찮았어요", "별로였어요" → 수치나 사례를 요청',
'  2. 주어 없는 답변: "개선이 필요해요" → 누가, 어떤 부분인지 요청',
'  3. 기간/범위 없는 답변: "최근에 변경했어요" → 언제, 얼마나인지 요청',
'  4. 비교 기준 없는 수치: "만족도 4.2점" → 이전 대비인지, 목표 대비인지 요청',
'- 모호도 감지 시 체크리스트를 true로 바꾸지 않습니다.',
'- 톤은 공감 → 구체화 요청 순서입니다. 예: "좋은 결과네요. 구체적으로 어떤 지표에서 그렇게 나왔는지 알려주시겠어요?"',
'- 구체화 요청 후에도 비슷한 수준의 답변이 오면, 집요하게 반복하지 말고 현재 답변으로 진행합니다. 체크리스트는 true로 처리합니다.',
'- 이 규칙은 best effort입니다. 대화 기록을 참고해 이미 같은 항목에서 구체화를 요청했다면 재질문하지 않습니다.',
```

### 3.2 프롬프트 내 체크리스트 가이드 확장

**현재**:
```typescript
const checklistGuide = template.checklist
  .map((item) => `- ${item.id}. ${item.label} (가중치 ${item.weight}) — ${item.intent}`)
  .join('\n');
```

**변경**:
```typescript
const checklistGuide = template.checklist
  .map((item) => `- ${item.id}. ${item.label} (가중치 ${item.weight}) — ${item.intent}\n  도움말: ${item.helpText}`)
  .join('\n');
```

이렇게 하면 LLM이 각 항목의 도움말을 알고 있으므로, 사용자가 "이 항목이 뭐야?"라고 물으면 helpText 기반으로 설명할 수 있다.

### 3.3 항목 설명 요청 처리 규칙

`[모호도 감지 규칙]` 블록 바로 앞에 아래 블록을 추가:

```typescript
'',
'[항목 설명 요청 처리]',
'- 사용자가 특정 체크리스트 항목의 의미를 물으면 (예: "목적이 뭐야?", "현황 항목이 정확히 뭘 말하는 건지"), 해당 항목의 도움말을 바탕으로 먼저 설명합니다.',
'- 설명 후에는 같은 항목에 대한 구체적 질문으로 바로 이어갑니다. 예: "이 항목은 ~입니다. 지금 작성하시는 보고서에서는 어떤 목적으로 쓰시나요?"',
'- 설명 요청은 인터뷰 흐름을 벗어나는 것이 아니라, 해당 항목을 채우기 위한 준비 단계로 취급합니다.',
```

이 규칙이 없으면 LLM이 도움말 질문을 무시하고 "체크리스트가 덜 채워진 항목을 우선 추적" 규칙에 따라 다른 항목으로 넘어갈 수 있다.

---

## 4. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| 메타데이터 파싱 (session-chat.ts) | 모호도 감지는 LLM 응답 텍스트에만 영향, 메타데이터 구조 변경 없음 |
| 체크리스트 JSON 형식 | `<!-- checklist:{"1":boolean,...} -->` 형식 유지 |
| canvas JSON 형식 | 변경 없음 |
| DB 스키마 | 변경 없음. helpText는 코드 상수 |
| 세션 서비스 (sessions/service.ts) | 변경 없음. helpText는 template에서 UI로 직접 전달됨 |
| 캔버스 탭 구조 | 기존 3탭 유지 |

---

## 5. CLAUDE.md 체크리스트

- [ ] `helpText`는 알파벳순으로 `id` 앞에 위치 (하네스 규칙: 프로퍼티 알파벳 정렬)
- [ ] `expandedHelpItemId` 상태는 다른 `useState` 선언과 알파벳순으로 정렬
- [ ] `handleChecklistHelpToggle`, `handleChecklistAskClick`은 기존 핸들러들과 알파벳순으로 위치
- [ ] JSX 내 인라인 익명 함수 금지 — 모든 핸들러는 return 전에 선언
- [ ] magic string 없음 — 프리필 메시지 포맷은 상수화 불필요 (한 곳에서만 사용)
- [ ] `npm run harness:check` 통과 확인
- [ ] `npm run build` 통과 확인

---

## 6. 구현 순서

1. `templates/index.ts` — `TemplateChecklistItem`에 `helpText` 필드 추가
2. `templates/index.ts` — `CHECKLIST_ITEMS`에 7개 아이템의 `helpText` 데이터 추가
3. `templates/index.ts` — `buildInterviewPrompt` 체크리스트 가이드에 도움말 포함
4. `templates/index.ts` — `buildInterviewPrompt`에 모호도 감지 규칙 블록 추가
5. `session-canvas.tsx` — `expandedHelpItemId` 상태 + 핸들러 2개 추가
6. `session-canvas.tsx` — 체크리스트 아이템 렌더링에 help 패널 추가
7. `npm run harness:check && npm run build`

---

## 7. 검증 방법

### 도움말 (변경 A)
1. 체크리스트 아이템의 "도움말" 버튼 클릭 → helpText 패널 토글 확인
2. "HARP에게 물어보기" 클릭 → chat input에 질문 프리필 확인
3. 다른 아이템 클릭 시 이전 help 패널 닫힘 확인

### 모호도 감지 (변경 B)
1. 인터뷰 중 "잘 됐어요"로 답변 → LLM이 구체화 요청하는지 확인
2. 구체화 요청 후에도 모호하게 답변 → LLM이 수용하고 진행하는지 확인
3. 모호 답변 시 체크리스트가 true로 바뀌지 않는지 확인 (메타데이터 주석 확인)
