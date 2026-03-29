# Landing Page Redesign Schema

> **문서 목적**: 구현 LLM이 `src/app/page.tsx`를 재작성하기 위한 설계 스키마.
> 설계 근거: VALUE_REDEF.md + 경쟁 분석(competitive-analysis.md) + 딥 리서치 결과 종합.
>
> **작성일**: 2026-03-29
> **대상 파일**: `src/app/page.tsx`
> **변경 범위**: 데이터 상수 + JSX 구조 전체 재작성. 새 파일 생성 없음.

---

## 0. 핵심 설계 원칙

| # | 원칙 | 근거 |
|---|------|------|
| 1 | Hero에서 "AI"로 시작하지 않는다 | 사내 사용자는 AI 피로도가 높음. 문제 해결로 리드 |
| 2 | 비교 대상은 GAUSS이다 | 실제 경쟁자는 사외 LLM이 아니라 사내에서 이미 쓰고 있는 GAUSS |
| 3 | 보안/데이터 허용은 차별점이 아니다 | GAUSS도 곧 인사 데이터 허용 예정. GAUSS가 **구조적으로 못 하는 것**(워크플로우, 축적, 품질 태깅)만 차별점으로 삼는다 |
| 4 | 3-Step으로 축약 | 4단계는 사용자에게 "복잡하다" 인상. 핵심 3단계로 압축 |
| 5 | "당신이 최종 검토합니다"가 1순위 신뢰 시그널 | 연구 결과: AI 도구에서 "You review everything"이 가장 강한 신뢰 장치 |
| 6 | CTA는 마이크로 커밋먼트 | "지금 시작하기"보다 "교육 결과 보고서 만들어 보기" 같은 구체적 행동 |

---

## 1. 섹션 구조 (위→아래 순서)

```
┌─────────────────────────────────────────┐
│  S1. Hero — 문제 인식 + 한 줄 가치      │
├─────────────────────────────────────────┤
│  S2. Pain — Before/After 비교 테이블    │
├─────────────────────────────────────────┤
│  S3. How It Works — 3-Step 시나리오     │
├─────────────────────────────────────────┤
│  S4. Value Triangle — 3대 핵심 가치     │
├─────────────────────────────────────────┤
│  S5. Trust — 신뢰/보안 시그널           │
├─────────────────────────────────────────┤
│  S6. CTA — 최종 행동 유도               │
└─────────────────────────────────────────┘
```

---

## 2. 각 섹션 상세 스키마

### S1. Hero

**목적**: 사용자가 3초 안에 "이게 내 문제를 해결한다"고 느끼게 한다.

```
Layout: surface / lg:grid-cols-[1.1fr_0.9fr] / p-10
좌측: section-label → h1 → 부제 → CTA 2개
우측: 통계 카드 3개 (세로 나열)
```

**카피**:

| 요소 | 텍스트 |
|------|--------|
| section-label | `HARP` |
| h1 | `보고서를 쓰는 데 반나절,`<br>`회사 양식으로 옮기는 데 또 반나절.` |
| subtitle | `HARP는 대화만으로 회사 표준 형식의 HR 보고서 초안을 만듭니다.`<br>`직전에 만든 같은 유형의 보고서가 있으면 자동으로 참고합니다.` |
| CTA primary | `교육 결과 보고서 만들어 보기` → href="/workspace/new" |
| CTA secondary | `작업공간 열기` → href="/workspace" |

**우측 통계 카드** (상수명: `HERO_STATS`):

```typescript
const HERO_STATS = [
  {
    label: '보고서 초안 생성',
    value: '3분',
    description: '대화 3분이면 섹션별 초안 완성',
  },
  {
    label: '표준 양식 준수',
    value: '100%',
    description: '회사 양식 벗어나지 않는 고정 출력',
  },
  {
    label: '반복 설명 감소',
    value: '자동 참고',
    description: '직전 동일 유형 산출물을 생성 시 자동 참조',
  },
];
```

**디자인 노트**:
- 통계 카드는 `doc-card` 클래스 사용
- value는 `text-3xl font-bold text-[var(--color-accent)]`
- description은 `meta` 클래스

---

### S2. Pain — "GAUSS로도 되지 않나?"

**목적**: 이미 GAUSS를 써본 사용자가 "그거랑 뭐가 다르지?" 질문에 즉답.

**핵심 변경**: "일반 LLM" → "GAUSS"로 실명 비교. 보안/데이터 허용은 GAUSS도 곧 풀리므로 차별점에서 제외. GAUSS가 **구조적으로 못 하는 것**만 비교.

```
Layout: surface / flex-col gap-6 / p-8
header: section-label "Why HARP" → h2 → 부제
body: 비교 테이블 (rounded border)
```

**카피**:

| 요소 | 텍스트 |
|------|--------|
| section-label | `Why HARP` |
| h2 | `GAUSS로도 보고서를 쓸 수 있지 않나요?` |
| subtitle | `쓸 수 있습니다. 다만 매번 처음부터, 매번 다른 형식으로, 매번 빠지는 항목이 생깁니다.` |

**비교 테이블** (상수명: `COMPARISON_ROWS`):

```typescript
const COMPARISON_ROWS = [
  {
    label: '시작할 때',
    gauss: '빈 채팅창에 프롬프트를 직접 잘 써야 합니다.',
    harp: '보고서 유형을 고르면 HARP가 먼저 질문합니다.',
  },
  {
    label: '빠지는 항목',
    gauss: '자유 대화라서 무엇을 빠뜨렸는지 모릅니다.',
    harp: '체크리스트가 내장되어 빠진 항목을 HARP가 추적합니다.',
  },
  {
    label: '결과 형식',
    gauss: '매번 답변 구조가 달라서 양식에 옮겨 적어야 합니다.',
    harp: '회사 표준 양식으로 초안이 바로 나옵니다.',
  },
  {
    label: '다음 보고서',
    gauss: '이전 대화가 남지 않아 다시 처음부터 설명합니다.',
    harp: '직전 동일 유형 산출물을 자동으로 참고해 줍니다.',
  },
  {
    label: '품질 확인',
    gauss: '답변이 맞는지 틀렸는지 직접 판단해야 합니다.',
    harp: '섹션마다 confidence·cited 태그가 붙어 약한 부분이 바로 보입니다.',
  },
];
```

**테이블 헤더**: `항목` | `GAUSS` | `HARP`

**디자인 노트**:
- 테이블 구조는 현재와 동일 (rounded-[var(--radius-lg)] border)
- HARP 열의 핵심 키워드에 `font-semibold text-[var(--color-text)]` 적용하지 않음 (깔끔하게)
- 5번째 행: 보안 → 품질 태깅(confidence/cited)으로 교체. 이건 GAUSS가 구조적으로 못 함

---

### S3. How It Works — 3-Step

**목적**: "복잡하지 않다"는 인상. 3단계면 끝.

**핵심 변경**: 4단계 → 3단계 압축. "작업 축적"은 S4에서 별도 가치로 다룸.

```
Layout: surface / flex-col gap-6 / p-8
header: section-label → h2 → subtitle
body: lg:grid-cols-3 카드
```

**카피**:

| 요소 | 텍스트 |
|------|--------|
| section-label | `How It Works` |
| h2 | `3분이면 초안이 나옵니다` |
| subtitle | `교육 결과 보고를 예로 들면 이렇습니다.` |

**스텝 카드** (상수명: `HOW_IT_WORKS_STEPS`):

```typescript
const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: '유형 선택',
    description:
      '주간 HR 현황, 교육 운영 결과, 제도 검토 중 하나를 고릅니다. 데이터가 있으면 그대로 붙여넣으세요.',
  },
  {
    step: '2',
    title: '대화로 채우기',
    description:
      'HARP가 빠진 항목을 질문합니다. 답하다 보면 오른쪽 캔버스에 섹션별 초안이 실시간으로 쌓입니다.',
  },
  {
    step: '3',
    title: '정리하기 클릭',
    description:
      '정리하기를 누르면 회사 양식의 초안이 완성됩니다. 수정하고 최종본으로 승격하세요.',
  },
];
```

**디자인 노트**:
- 각 카드는 `doc-card p-6`
- step 번호는 `badge badge-teal` 내부에 `Step {step}` 형태
- 3컬럼 그리드 (`lg:grid-cols-3`)

---

### S4. Value Triangle — 3대 핵심 가치

**목적**: VALUE_REDEF의 가치 삼각형을 사용자 언어로 번역.

```
Layout: surface / flex-col gap-6 / p-8
header: section-label → h2
body: lg:grid-cols-3 카드
```

**카피**:

| 요소 | 텍스트 |
|------|--------|
| section-label | `Core Value` |
| h2 | `AI를 잘 쓰는 방법을 배울 필요가 없습니다` |

**가치 카드** (상수명: `VALUE_CARDS`):

```typescript
const VALUE_CARDS = [
  {
    badge: '컨텍스트 설계',
    title: '매번 같은 설명을 반복하지 않아도 됩니다',
    description:
      '작업공간이 이전 세션, 근거자료, 산출물을 기억합니다. 새 보고서를 쓸 때 과거 맥락이 자동으로 공급됩니다.',
  },
  {
    badge: '방법론 내장',
    title: '빠뜨리는 항목 없이 표준 품질이 나옵니다',
    description:
      '보고서 구조화, 근거 배치, 요약 전략이 시스템에 내장되어 있습니다. 프롬프트를 잘 쓰는 기술이 아니라 도메인 전문성의 코드화입니다.',
  },
  {
    badge: '작업 이력',
    title: '지난번 보고서를 다시 찾을 필요가 없습니다',
    description:
      '세션, 근거자료, 산출물이 작업공간에 남습니다. 같은 유형의 보고서를 다시 쓸 때 직전 산출물을 자동으로 참고합니다.',
  },
];
```

**디자인 노트**:
- badge 색상 순서: `badge-accent` → `badge-teal` → `badge-success`
- 카드는 `doc-card p-6`
- 기존 VALUE_CARDS의 영문 badge 대신 한글 badge로 교체 (사용자가 HR 담당자)

---

### S5. Trust — 신뢰 시그널

**목적**: "AI가 멋대로 하면 어쩌지?" 불안 해소. 연구 결과 "You review everything"이 1순위.

```
Layout: surface / flex-col gap-5 / p-8
header: section-label → h2 → subtitle
body: 2-column grid (lg:grid-cols-2) 카드
```

**카피**:

| 요소 | 텍스트 |
|------|--------|
| section-label | `Trust` |
| h2 | `AI는 초안만 씁니다. 최종 판단은 언제나 담당자의 몫입니다.` |

**신뢰 카드** (상수명: `TRUST_SIGNALS`):

```typescript
const TRUST_SIGNALS = [
  {
    title: '당신이 최종 검토합니다',
    description:
      'HARP는 초안을 제안할 뿐입니다. draft → final 승격은 반드시 담당자가 확인한 후에만 가능합니다.',
  },
  {
    title: '근거가 표시됩니다',
    description:
      '각 섹션에 confidence(확신도)와 cited(근거 유무)가 태깅됩니다. 어디가 약한지 한눈에 보입니다.',
  },
  {
    title: '기존 업무 방식은 그대로입니다',
    description:
      'HARP는 보고서 작성 단계만 도와줍니다. 기존 결재선, 공유 방식, 양식 규정은 바뀌지 않습니다.',
  },
  {
    title: '작업공간은 개인 전용입니다',
    description:
      '현재는 본인 작업만 볼 수 있습니다. 다른 사람의 세션이나 산출물에 접근할 수 없습니다.',
  },
];
```

**디자인 노트**:
- 카드는 `doc-card p-6`
- 2x2 그리드
- 첫 번째 카드("당신이 최종 검토합니다")에 `border-[var(--color-teal)]` 강조 테두리

---

### S6. CTA — 최종 행동 유도

**목적**: 마이크로 커밋먼트. "하나만 만들어 보세요".

```
Layout: surface / flex-col gap-5 / p-8
header: section-label → h2 → subtitle
body: CTA 버튼 2개
```

**카피**:

| 요소 | 텍스트 |
|------|--------|
| section-label | `Get Started` |
| h2 | `교육 결과 보고서 하나만 만들어 보세요` |
| subtitle | `3분이면 첫 초안이 나옵니다. 그다음부터는 작업공간이 기억해 줍니다.` |
| CTA primary | `교육 결과 보고서 만들어 보기` → href="/workspace/new" |
| CTA secondary | `로그인` → href="/login" |

**디자인 노트**:
- CTA primary: `btn-teal focus-ring` (Hero와 차별화 — Hero는 btn-primary, 마지막은 btn-teal)
- CTA secondary: `btn-secondary focus-ring`

---

## 3. 상수 구조 요약 (구현 LLM 참고용)

```typescript
// page.tsx 최상단에 선언할 상수 목록:
const HERO_STATS: Array<{ label: string; value: string; description: string }>
const COMPARISON_ROWS: Array<{ label: string; gauss: string; harp: string }>
const HOW_IT_WORKS_STEPS: Array<{ step: string; title: string; description: string }>
const VALUE_CARDS: Array<{ badge: string; title: string; description: string }>
const TRUST_SIGNALS: Array<{ title: string; description: string }>
```

키 변경점:
- `COMPARISON_ROWS`의 `general` 필드 → `gauss`로 변경 (GAUSS 실명 비교)
- `HOW_IT_WORKS_STEPS`에 `step` 필드 추가, 4개 → 3개 축소
- `HERO_STATS` 신규 추가
- `TRUST_SIGNALS` 신규 추가

---

## 4. 현재 page.tsx 대비 변경 매핑

| 현재 섹션 | 변경 | 설계 섹션 |
|-----------|------|-----------|
| Hero (L68-108) | **재작성** — h1 카피 교체, 우측 VALUE_CARDS → HERO_STATS, CTA 카피 변경 | S1 |
| Why HARP 비교 테이블 (L110-149) | **수정** — h2 카피 교체, 테이블 헤더 "일반 LLM" → "GAUSS", 5행(보안→품질태깅)으로 변경 | S2 |
| Scenario 4-Step (L151-173) | **축소** — 4 → 3 스텝, 카피 전면 교체 | S3 |
| Core Principle (L175-196) | **대체** — Value Triangle 3카드 + Trust 4카드로 분리 | S4 + S5 |
| (없음) | **신규** — 최종 CTA 섹션 | S6 |

---

## 5. CLAUDE.md 준수 체크리스트 (구현 LLM용)

- [ ] Server Component 유지 (use client 없음)
- [ ] default export (App Router page.tsx 예외 허용)
- [ ] 상수는 SCREAMING_SNAKE_CASE 또는 PascalCase로 최상단 선언
- [ ] JSX 내 인라인 익명 함수 없음
- [ ] import는 5그룹 순서 준수 (여기서는 Link만 사용)
- [ ] 디자인 토큰은 globals.css의 CSS 변수 사용 (하드코딩 금지)
- [ ] 컴포넌트 클래스는 globals.css에 정의된 것만 사용 (surface, doc-card, badge-*, btn-*, etc.)
- [ ] magic string 없음 (모든 텍스트는 상수로 추출됨)
- [ ] any 타입 없음

---

## 6. 구현 순서 (권장)

1. 기존 상수 5개 제거 (COMPARISON_ROWS, HOW_IT_WORKS_STEPS, VALUE_CARDS)
2. 새 상수 5개 선언 (HERO_STATS, COMPARISON_ROWS, HOW_IT_WORKS_STEPS, VALUE_CARDS, TRUST_SIGNALS)
3. JSX를 S1→S6 순서로 재작성
4. `npm run harness:check` 통과 확인
5. 빌드 확인 (`npm run build`)

---

## 7. 스코프 외 (이 문서에서 다루지 않음)

- 글로벌 네비게이션 (`layout.tsx` 수정) — 별도 작업
- 다크모드 토글 — 별도 작업
- 로그인/회원가입 페이지 — 별도 작업
- 반응형 모바일 최적화 — 별도 작업 (기본 flex/grid 반응형은 유지)
