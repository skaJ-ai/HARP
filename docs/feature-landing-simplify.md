# Feature Design: 랜딩 페이지 간소화

> **문서 목적**: 구현 LLM이 랜딩 페이지를 간소화하고 소개 페이지를 분리하기 위한 설계 스키마.
> **작성일**: 2026-03-30
> **리서치 근거**: HR-Process-Coaching AI 레퍼런스 — 사내 도구는 마케팅이 아니라 진입 속도가 핵심
> **변경 파일**: 2개 (기존 page.tsx 리팩토링 1, 신규 about/page.tsx 1)

---

## 0. 현재 상태 분석

### `/` (page.tsx) — 443줄, 6섹션 마케팅 페이지

```
Header (HARP 브랜드 + 로그인 + CTA)
Hero (헤드라인 2줄 + 서브 2줄 + CTA 2개 + Stats 3장)
Pain (GAUSS 비교표 5행)
How It Works (3단계)
Value Triangle (3카드)
Trust (4시그널)
CTA (최종 액션)
```

**문제**: 사내 도구인데 외부 SaaS 랜딩처럼 설계됨. 사용자는 이미 HARP를 안다 — 6섹션 스크롤은 불필요.

### 레퍼런스: HR-Process-Coaching AI

- 헤더 하나, 바로 작업 화면
- 사이드바 + 포커스 콘텐츠
- "홈으로" 버튼으로 네비게이션
- **마케팅 없음 — 도구 중심**

---

## 1. 핵심 설계 결정

### 1.1 페이지 분리

| 경로 | 역할 | 내용 |
|------|------|------|
| **`/`** | 진입점 | 헤더 + 축소 Hero + 템플릿 3장 + 로그인 |
| **`/about`** | 소개 | 기존 Pain, How It Works, Value, Trust, CTA 이동 |

### 1.2 왜 분리인가

| 대안 | 문제 |
|------|------|
| 현행 유지 (6섹션 원페이지) | 도구인데 마케팅 페이지처럼 보임. 진입까지 스크롤 필요 |
| 마케팅 콘텐츠 삭제 | 신규 사용자에게 "왜 HARP인가" 설명 수단이 사라짐 |
| **분리** | 진입은 빠르게, 궁금하면 소개로. 양쪽 모두 충족 |

### 1.3 `/` 구조 (목표 ~100줄)

```
Header:  HARP 브랜드 + "소개" 링크 + 로그인 + 시작 CTA
Hero:    헤드라인 1줄 + 서브 1줄 (현행 2줄에서 축소)
Cards:   템플릿 3장 (주간 HR 현황 · 교육 운영 결과 · 제도 검토)
Footer:  "더 알아보기" → /about 링크
```

---

## 2. 변경 파일별 스펙

### 2.1 `src/app/page.tsx` — 리팩토링

#### 유지할 상수

```typescript
// 그대로 유지
const HEADER_COPY = {
  brand: 'HARP',
  primaryAction: {
    href: '/workspace/new',
    label: '새 작업 시작',       // ← 라벨 축소
  },
  secondaryAction: {
    href: '/login',
    label: '로그인',
  },
  subtitle: 'HR AI Report Platform',
} as const;
```

#### 축소할 상수

**현재 HERO_COPY** (headlineFirstLine/SecondLine 2줄 + subtitleFirstLine/SecondLine 2줄):
```typescript
const HERO_COPY = {
  headlineFirstLine: '보고서를 쓰는 데 반나절,',
  headlineSecondLine: '회사 양식으로 옮기는 데 또 반나절.',
  // ...
};
```

**변경**:
```typescript
const HERO_COPY = {
  headline: '대화만으로 회사 표준 HR 보고서 초안을 만듭니다',
  label: 'HARP',
  primaryAction: {
    href: '/workspace/new',
    label: '새 작업 시작',
  },
  subtitle: '유형을 고르면 HARP가 먼저 질문합니다. 3분이면 초안이 나옵니다.',
} as const;
```

변경 포인트:
- 헤드라인 2줄 → 1줄 (핵심 가치 직접 전달)
- 서브타이틀 2줄 → 1줄
- CTA 2개 → 1개 ("새 작업 시작"만. "작업공간 열기"는 로그인 후 자연히 보임)
- `HERO_STATS` 삭제 — 템플릿 카드로 대체

#### 삭제할 상수 및 함수

page.tsx에서 완전히 제거:
```
HERO_STATS, HeroStat
PAIN_SECTION_COPY, COMPARISON_ROWS, ComparisonRow
HOW_IT_WORKS_SECTION_COPY, HOW_IT_WORKS_STEPS, HowItWorksStep
VALUE_SECTION_COPY, VALUE_CARDS, ValueCard
TRUST_SECTION_COPY, TRUST_SIGNALS, TrustSignal
FINAL_CTA_COPY
getValueBadgeClassName, getTrustCardClassName
renderHeroStat, renderComparisonRow, renderHowItWorksStep, renderValueCard, renderTrustSignal
```

이들은 모두 `/about` 페이지로 이동.

#### 추가할 상수

```typescript
interface TemplatePreview {
  description: string;
  estimatedMinutes: number;
  name: string;
  type: string;
}

const TEMPLATE_PREVIEWS: TemplatePreview[] = [
  {
    description: '한 주의 주요 이슈, 진행 현황, 지표, 다음 주 계획을 빠르게 정리합니다.',
    estimatedMinutes: 6,
    name: '주간 HR 현황 보고',
    type: 'weekly_report',
  },
  {
    description: '교육 개요부터 Kirkpatrick 4단계, 인사이트와 개선 제안까지 표준 구조로 정리합니다.',
    estimatedMinutes: 8,
    name: '교육 운영 결과 요약',
    type: 'training_summary',
  },
  {
    description: '배경, 현행 분석, 비교안, 리스크, 제안까지 한 번에 정리하는 정책 검토 초안입니다.',
    estimatedMinutes: 12,
    name: '제도 검토 초안',
    type: 'policy_review',
  },
];

const ABOUT_LINK_COPY = {
  href: '/about',
  label: 'HARP가 뭔가요?',
} as const;
```

`TEMPLATE_PREVIEWS`는 `RAW_TEMPLATE_DEFINITIONS`에서 가져오지 **않는다** — page.tsx는 서버 컴포넌트이고 import 가능하지만, 랜딩 페이지에 templates 모듈 의존을 넣으면 번들이 무거워진다. 상수로 하드코딩한다.

#### 렌더 함수

```typescript
function renderTemplatePreview(template: TemplatePreview): ReactElement {
  return (
    <article className="doc-card flex flex-col gap-4 p-6" key={template.type}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="badge badge-accent">{template.type}</span>
          <h3 className="text-xl font-semibold text-[var(--color-text)]">
            {template.name}
          </h3>
        </div>
        <span className="badge badge-neutral">{template.estimatedMinutes}분</span>
      </div>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
        {template.description}
      </p>
    </article>
  );
}
```

#### JSX 구조

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.85),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.7),_transparent_28%),var(--color-bg)] px-6 py-6 lg:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Header — 소개 링크 추가 */}
        <header className="surface flex flex-col gap-4 px-6 py-4 shadow-[var(--shadow-1)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              {HEADER_COPY.brand}
            </span>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {HEADER_COPY.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition" href={ABOUT_LINK_COPY.href}>
              {ABOUT_LINK_COPY.label}
            </Link>
            <Link className="btn-secondary focus-ring" href={HEADER_COPY.secondaryAction.href}>
              {HEADER_COPY.secondaryAction.label}
            </Link>
            <Link className="btn-primary focus-ring" href={HEADER_COPY.primaryAction.href}>
              {HEADER_COPY.primaryAction.label}
            </Link>
          </div>
        </header>

        {/* Hero — 축소 */}
        <section className="surface rounded-[32px] px-8 py-10 shadow-[var(--shadow-4)] lg:px-10 lg:py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="section-label">{HERO_COPY.label}</span>
            <h1 className="text-balance text-3xl font-bold leading-tight text-[var(--color-text)] lg:text-5xl">
              {HERO_COPY.headline}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] lg:text-lg">
              {HERO_COPY.subtitle}
            </p>
            <Link className="btn-primary focus-ring" href={HERO_COPY.primaryAction.href}>
              {HERO_COPY.primaryAction.label}
            </Link>
          </div>
        </section>

        {/* 템플릿 카드 */}
        <section className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {TEMPLATE_PREVIEWS.map(renderTemplatePreview)}
          </div>
        </section>

        {/* 소개 링크 */}
        <div className="flex justify-center">
          <Link
            className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition"
            href={ABOUT_LINK_COPY.href}
          >
            {ABOUT_LINK_COPY.label} →
          </Link>
        </div>
      </div>
    </main>
  );
}
```

변경 포인트:
1. `max-w-7xl` → `max-w-5xl` (좁은 레이아웃)
2. Hero의 장식 gradient circles 삭제 (불필요한 시각 복잡도)
3. Hero 중앙 정렬 (`text-center`, `items-center`)
4. Stats 카드 대신 템플릿 프리뷰 카드 3장
5. 하단에 "HARP가 뭔가요? →" 텍스트 링크

### 2.2 `src/app/about/page.tsx` — 신규 생성

기존 page.tsx의 마케팅 콘텐츠를 그대로 이동.

#### 이동할 상수 및 함수

```
// 타입
HeroStat, ComparisonRow, HowItWorksStep, ValueCard, TrustSignal

// 상수
HERO_STATS
PAIN_SECTION_COPY, COMPARISON_ROWS
HOW_IT_WORKS_SECTION_COPY, HOW_IT_WORKS_STEPS
VALUE_SECTION_COPY, VALUE_CARDS
TRUST_SECTION_COPY, TRUST_SIGNALS
FINAL_CTA_COPY

// 헬퍼 함수
getValueBadgeClassName, getTrustCardClassName
renderHeroStat, renderComparisonRow, renderHowItWorksStep, renderValueCard, renderTrustSignal
```

#### JSX 구조

```tsx
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[...same gradient...] px-6 py-6 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Header */}
        <header className="surface flex flex-col gap-4 px-6 py-4 shadow-[var(--shadow-1)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">HARP</span>
            <p className="text-sm text-[var(--color-text-secondary)]">HR AI Report Platform</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="btn-secondary focus-ring" href="/">홈으로</Link>
            <Link className="btn-primary focus-ring" href="/workspace/new">새 작업 시작</Link>
          </div>
        </header>

        {/* 기존 Hero Stats */}
        {/* 기존 Pain (GAUSS 비교표) */}
        {/* 기존 How It Works (3단계) */}
        {/* 기존 Value Triangle (3카드) */}
        {/* 기존 Trust (4시그널) */}
        {/* 기존 CTA */}

        {/* 모두 현재 page.tsx의 JSX를 그대로 복사 */}
      </div>
    </main>
  );
}
```

핵심: **기존 마케팅 콘텐츠는 1글자도 변경하지 않는다.** 파일만 이동.

---

## 3. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| `/workspace` (대시보드) | 로그인 후 작업 화면 — 변경 불필요 |
| `/workspace/new` (템플릿 선택) | 이미 잘 동작하는 인증된 사용자용 페이지 |
| `NewSessionForm` 컴포넌트 | 변경 불필요. 랜딩의 카드는 순수 표시용 |
| `/login` | 변경 불필요 |
| 백엔드/서비스 레이어 | 순수 프론트엔드 변경 |
| CSS/디자인 토큰 | 기존 클래스 재사용 |

---

## 4. CLAUDE.md 체크리스트

- [ ] `about/page.tsx`는 App Router 규칙에 따라 default export
- [ ] `page.tsx`의 default export 유지 (App Router 요구)
- [ ] `TEMPLATE_PREVIEWS`는 SCREAMING_SNAKE_CASE 상수
- [ ] `renderTemplatePreview`는 모듈 스코프 함수
- [ ] `ABOUT_LINK_COPY`는 SCREAMING_SNAKE_CASE 상수
- [ ] about 페이지의 기존 콘텐츠는 내용 변경 없이 파일 이동만
- [ ] 기존 page.tsx에서 삭제한 타입/상수/함수가 about에 모두 존재하는지 확인
- [ ] `npm run harness:check` 통과 확인
- [ ] `npm run build` 통과 확인

---

## 5. 구현 순서

1. `src/app/about/page.tsx` 신규 생성 — 기존 page.tsx의 마케팅 콘텐츠 + 타입 + 상수 + 함수 전체 이동
2. `src/app/about/page.tsx` 헤더에 "홈으로" 링크 추가 (→ `/`)
3. `src/app/page.tsx` — 이동한 상수/함수 삭제
4. `src/app/page.tsx` — HERO_COPY 축소 (2줄→1줄)
5. `src/app/page.tsx` — TEMPLATE_PREVIEWS 상수 + renderTemplatePreview 함수 추가
6. `src/app/page.tsx` — ABOUT_LINK_COPY 상수 추가
7. `src/app/page.tsx` — JSX를 Header + Hero(축소) + Templates + About Link로 교체
8. `npm run harness:check && npm run build`

---

## 6. 검증 방법

1. **`/`** — 스크롤 없이 전체 콘텐츠가 한 화면에 보이는지 확인
2. **`/`** — 템플릿 카드 3장이 보이는지 확인
3. **`/`** — "HARP가 뭔가요?" 링크 클릭 → `/about`으로 이동 확인
4. **`/`** — "새 작업 시작" 버튼 → `/workspace/new`로 이동 확인
5. **`/about`** — 기존 6섹션 마케팅 콘텐츠가 모두 표시되는지 확인
6. **`/about`** — "홈으로" 링크 → `/`로 이동 확인
7. **`/about`** — GAUSS 비교표, How It Works, Value, Trust 모두 원본과 동일한지 확인

---

## 7. 기대 효과

| 지표 | 현재 | 변경 후 |
|------|------|---------|
| `/` 줄 수 | 443줄 | ~90줄 |
| 첫 화면에서 CTA까지 | 스크롤 5회+ | 스크롤 0 |
| 마케팅 콘텐츠 | 삭제됨 | `/about`에 보존 |
| 진입 → 작업 시작 | 2~3 스크롤 + 클릭 | 1 클릭 |
