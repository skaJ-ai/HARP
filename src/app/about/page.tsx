'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import Link from 'next/link';

interface HeroStat {
  description: string;
  label: string;
  value: string;
}

interface ComparisonRow {
  gauss: string;
  harp: string;
  label: string;
}

interface HowItWorksStep {
  description: string;
  step: string;
  title: string;
}

interface IntroSlide {
  id: 'hero' | 'comparison' | 'steps' | 'values' | 'trust' | 'cta';
  label: string;
  summary: string;
  title: string;
}

interface ValueCard {
  badge: string;
  description: string;
  title: string;
}

interface TrustSignal {
  description: string;
  title: string;
}

const PAGE_COPY = {
  brand: 'HARP',
  homeAction: {
    href: '/',
    label: '홈으로',
  },
  keyboardHint: 'Left / Right 키로 이동',
  primaryAction: {
    href: '/workspace/new',
    label: '새 작업 시작',
  },
  subtitle: 'HR AI Report Platform',
  title: '도구 소개',
} as const;

const HERO_COPY = {
  headlineFirstLine: '보고서를 쓰는 데 반나절,',
  headlineSecondLine: '회사 양식으로 옮기는 데 또 반나절.',
  label: 'HARP',
  subtitleFirstLine: 'HARP는 대화만으로 회사 표준 형식의 HR 보고서 초안을 만듭니다.',
  subtitleSecondLine: '직전에 만든 같은 유형의 보고서가 있으면 자동으로 참고합니다.',
} as const;

const HERO_STATS: HeroStat[] = [
  {
    description: '대화 3분이면 섹션별 초안 완성',
    label: '보고서 초안 생성',
    value: '3분',
  },
  {
    description: '회사 양식 벗어나지 않는 고정 출력',
    label: '표준 양식 준수',
    value: '100%',
  },
  {
    description: '직전 동일 유형 산출물을 생성 시 자동 참조',
    label: '반복 설명 감소',
    value: '자동 참고',
  },
];

const PAIN_SECTION_COPY = {
  heading: 'GAUSS로도 보고서를 쓸 수 있지 않나요?',
  label: 'Why HARP',
  subtitle: '쓸 수 있습니다. 다만 매번 처음부터, 매번 다른 형식으로, 매번 빠지는 항목이 생깁니다.',
  tableHeaders: {
    gauss: 'GAUSS',
    harp: 'HARP',
    label: '항목',
  },
} as const;

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    gauss: '빈 채팅창에 프롬프트를 직접 잘 써야 합니다.',
    harp: '보고서 유형을 고르면 HARP가 먼저 질문합니다.',
    label: '시작할 때',
  },
  {
    gauss: '자유 대화라서 무엇을 빠뜨렸는지 모릅니다.',
    harp: '체크리스트가 내장되어 빠진 항목을 HARP가 추적합니다.',
    label: '빠지는 항목',
  },
  {
    gauss: '매번 답변 구조가 달라서 양식에 옮겨 적어야 합니다.',
    harp: '회사 표준 양식으로 초안이 바로 나옵니다.',
    label: '결과 형식',
  },
  {
    gauss: '이전 대화가 남지 않아 다시 처음부터 설명합니다.',
    harp: '직전 동일 유형 산출물을 자동으로 참고해 줍니다.',
    label: '다음 보고서',
  },
  {
    gauss: '답변이 맞는지 틀렸는지 직접 판단해야 합니다.',
    harp: '섹션마다 confidence·cited 태그가 붙어 약한 부분이 바로 보입니다.',
    label: '품질 확인',
  },
];

const HOW_IT_WORKS_SECTION_COPY = {
  heading: '3분이면 초안이 나옵니다',
  label: 'How It Works',
  subtitle: '교육 결과 보고를 예로 들면 이렇습니다.',
} as const;

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    description:
      '주간 HR 현황, 교육 운영 결과, 제도 검토 중 하나를 고릅니다. 데이터가 있으면 그대로 붙여넣으세요.',
    step: '1',
    title: '유형 선택',
  },
  {
    description:
      'HARP가 빠진 항목을 질문합니다. 답하다 보면 오른쪽 캔버스에 섹션별 초안이 실시간으로 쌓입니다.',
    step: '2',
    title: '대화로 채우기',
  },
  {
    description: '정리하기를 누르면 회사 양식의 초안이 완성됩니다. 수정하고 최종본으로 승격하세요.',
    step: '3',
    title: '정리하기 클릭',
  },
];

const VALUE_SECTION_COPY = {
  heading: 'AI를 잘 쓰는 방법을 배울 필요가 없습니다',
  label: 'Core Value',
} as const;

const VALUE_CARDS: ValueCard[] = [
  {
    badge: '컨텍스트 설계',
    description:
      '작업공간에 세션, 근거자료, 산출물이 보관됩니다. 같은 유형의 보고서를 다시 쓸 때 최근 3건의 동일 유형 산출물을 자동으로 참고합니다.',
    title: '매번 같은 설명을 반복하지 않아도 됩니다',
  },
  {
    badge: '방법론 내장',
    description:
      '보고서 구조화, 근거 배치, 요약 전략이 시스템에 내장되어 있습니다. 프롬프트를 잘 쓰는 기술이 아니라 도메인 전문성의 코드화입니다.',
    title: '빠뜨리는 항목 없이 표준 품질이 나옵니다',
  },
  {
    badge: '작업 이력',
    description:
      '세션, 근거자료, 산출물이 작업공간에 남습니다. 같은 유형의 보고서를 다시 쓸 때 직전 산출물을 자동으로 참고합니다.',
    title: '지난번 보고서를 다시 찾을 필요가 없습니다',
  },
];

const TRUST_SECTION_COPY = {
  heading: 'AI는 초안만 씁니다. 최종 판단은 언제나 담당자의 몫입니다.',
  label: 'Trust',
} as const;

const TRUST_SIGNALS: TrustSignal[] = [
  {
    description:
      'HARP는 초안을 제안할 뿐입니다. draft -> final 승격은 반드시 담당자가 확인한 후에만 가능합니다.',
    title: '당신이 최종 검토합니다',
  },
  {
    description:
      '각 섹션에 confidence(확신도)와 cited(근거 유무)가 태깅됩니다. 어디가 약한지 한눈에 보입니다.',
    title: '근거가 표시됩니다',
  },
  {
    description:
      'HARP는 보고서 작성 단계만 도와줍니다. 기존 결재선, 공유 방식, 양식 규정은 바뀌지 않습니다.',
    title: '기존 업무 방식은 그대로입니다',
  },
  {
    description:
      '현재는 본인 작업만 볼 수 있습니다. 다른 사람의 세션이나 산출물에 접근할 수 없습니다.',
    title: '작업공간은 개인 전용입니다',
  },
];

const FINAL_CTA_COPY = {
  heading: '교육 결과 보고서 하나만 만들어 보세요',
  label: 'Get Started',
  primaryAction: {
    href: '/workspace/new',
    label: '교육 결과 보고서 만들어 보기',
  },
  secondaryAction: {
    href: '/login',
    label: '로그인',
  },
  subtitle: '3분이면 첫 초안이 나옵니다. 그다음부터는 작업공간이 기억해 줍니다.',
} as const;

const INTRO_SLIDES: IntroSlide[] = [
  {
    id: 'hero',
    label: 'Overview',
    summary: '문제 정의와 결과를 먼저 보여줍니다.',
    title: '보고서를 왜 HARP로 시작하는가',
  },
  {
    id: 'comparison',
    label: PAIN_SECTION_COPY.label,
    summary: 'GAUSS와 달리 워크플로우, 형식, 품질 확인이 구조에 들어 있습니다.',
    title: PAIN_SECTION_COPY.heading,
  },
  {
    id: 'steps',
    label: HOW_IT_WORKS_SECTION_COPY.label,
    summary: '복잡한 학습 없이 3단계로 초안까지 도달합니다.',
    title: HOW_IT_WORKS_SECTION_COPY.heading,
  },
  {
    id: 'values',
    label: VALUE_SECTION_COPY.label,
    summary: '도메인 방법론과 작업 이력이 시스템 안에 남습니다.',
    title: VALUE_SECTION_COPY.heading,
  },
  {
    id: 'trust',
    label: TRUST_SECTION_COPY.label,
    summary: '최종 판단은 사람에게 남기고, 약한 부분은 드러나게 설계했습니다.',
    title: TRUST_SECTION_COPY.heading,
  },
  {
    id: 'cta',
    label: FINAL_CTA_COPY.label,
    summary: '설명은 여기까지, 다음 행동은 바로 시작입니다.',
    title: FINAL_CTA_COPY.heading,
  },
];

function getValueBadgeClassName(index: number): string {
  if (index === 0) {
    return 'badge-accent';
  }

  if (index === 1) {
    return 'badge-teal';
  }

  return 'badge-success';
}

function getTrustCardClassName(index: number): string {
  if (index === 0) {
    return 'doc-card border-[var(--color-teal)] p-6';
  }

  return 'doc-card p-6';
}

function renderHeroStat(stat: HeroStat): ReactElement {
  return (
    <article className="doc-card flex h-full flex-col gap-3 p-6" key={stat.label}>
      <p className="meta">{stat.label}</p>
      <p className="text-3xl font-bold text-[var(--color-accent)]">{stat.value}</p>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{stat.description}</p>
    </article>
  );
}

function renderComparisonRow(row: ComparisonRow): ReactElement {
  return (
    <tr className="border-t border-[var(--color-border-subtle)] align-top" key={row.label}>
      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">{row.label}</td>
      <td className="px-5 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        {row.gauss}
      </td>
      <td className="px-5 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">{row.harp}</td>
    </tr>
  );
}

function renderHowItWorksStep(step: HowItWorksStep): ReactElement {
  return (
    <article className="doc-card p-6" key={step.step}>
      <div className="flex flex-col gap-4">
        <span className="badge badge-teal w-fit">{`Step ${step.step}`}</span>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-[var(--color-text)]">{step.title}</h3>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{step.description}</p>
        </div>
      </div>
    </article>
  );
}

function renderValueCard(card: ValueCard, index: number): ReactElement {
  return (
    <article className="doc-card p-6" key={card.title}>
      <div className="flex flex-col gap-4">
        <span className={`badge ${getValueBadgeClassName(index)} w-fit`}>{card.badge}</span>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-[var(--color-text)]">{card.title}</h3>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{card.description}</p>
        </div>
      </div>
    </article>
  );
}

function renderTrustSignal(signal: TrustSignal, index: number): ReactElement {
  return (
    <article className={getTrustCardClassName(index)} key={signal.title}>
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold text-[var(--color-text)]">{signal.title}</h3>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{signal.description}</p>
      </div>
    </article>
  );
}

function renderSlideContent(slide: IntroSlide): ReactElement {
  if (slide.id === 'hero') {
    return (
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <span className="section-label">{HERO_COPY.label}</span>
          <div className="flex flex-col gap-4">
            <h1 className="text-balance text-4xl font-bold leading-tight text-[var(--color-text)] lg:text-6xl">
              <span className="block">{HERO_COPY.headlineFirstLine}</span>
              <span className="block">{HERO_COPY.headlineSecondLine}</span>
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--color-text-secondary)] lg:text-lg">
              <span className="block">{HERO_COPY.subtitleFirstLine}</span>
              <span className="block">{HERO_COPY.subtitleSecondLine}</span>
            </p>
          </div>
        </div>
        <div className="grid gap-4">{HERO_STATS.map(renderHeroStat)}</div>
      </section>
    );
  }

  if (slide.id === 'comparison') {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="section-label">{PAIN_SECTION_COPY.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">
            {PAIN_SECTION_COPY.heading}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            {PAIN_SECTION_COPY.subtitle}
          </p>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--color-bg-sunken)]">
                <th className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                  {PAIN_SECTION_COPY.tableHeaders.label}
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                  {PAIN_SECTION_COPY.tableHeaders.gauss}
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                  {PAIN_SECTION_COPY.tableHeaders.harp}
                </th>
              </tr>
            </thead>
            <tbody>{COMPARISON_ROWS.map(renderComparisonRow)}</tbody>
          </table>
        </div>
      </section>
    );
  }

  if (slide.id === 'steps') {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="section-label">{HOW_IT_WORKS_SECTION_COPY.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">
            {HOW_IT_WORKS_SECTION_COPY.heading}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            {HOW_IT_WORKS_SECTION_COPY.subtitle}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map(renderHowItWorksStep)}
        </div>
      </section>
    );
  }

  if (slide.id === 'values') {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="section-label">{VALUE_SECTION_COPY.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">
            {VALUE_SECTION_COPY.heading}
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">{VALUE_CARDS.map(renderValueCard)}</div>
      </section>
    );
  }

  if (slide.id === 'trust') {
    return (
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="section-label">{TRUST_SECTION_COPY.label}</span>
          <h2 className="max-w-4xl text-3xl font-semibold text-[var(--color-text)]">
            {TRUST_SECTION_COPY.heading}
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">{TRUST_SIGNALS.map(renderTrustSignal)}</div>
      </section>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="section-label">{FINAL_CTA_COPY.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">
            {FINAL_CTA_COPY.heading}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            {FINAL_CTA_COPY.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-teal focus-ring" href={FINAL_CTA_COPY.primaryAction.href}>
            {FINAL_CTA_COPY.primaryAction.label}
          </Link>
          <Link className="btn-secondary focus-ring" href={FINAL_CTA_COPY.secondaryAction.href}>
            {FINAL_CTA_COPY.secondaryAction.label}
          </Link>
        </div>
      </div>
      <div className="workspace-card-muted flex max-w-sm flex-col gap-3">
        <p className="meta">Start Here</p>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          설명은 여기서 끝입니다. 실제 가치 판단은 템플릿을 하나 골라 초안을 받아보면 바로
          확인됩니다.
        </p>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = INTRO_SLIDES[currentSlide] ?? INTRO_SLIDES[0]!;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === INTRO_SLIDES.length - 1;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (event.key === 'ArrowRight') {
        setCurrentSlide((previousSlide) => Math.min(previousSlide + 1, INTRO_SLIDES.length - 1));
      }

      if (event.key === 'ArrowLeft') {
        setCurrentSlide((previousSlide) => Math.max(previousSlide - 1, 0));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.85),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.7),_transparent_28%),var(--color-bg)] px-6 py-6 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="surface flex flex-col gap-4 px-6 py-4 shadow-[var(--shadow-1)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              {PAGE_COPY.brand}
            </span>
            <p className="text-sm text-[var(--color-text-secondary)]">{PAGE_COPY.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="btn-secondary focus-ring" href={PAGE_COPY.homeAction.href}>
              {PAGE_COPY.homeAction.label}
            </Link>
            <Link className="btn-primary focus-ring" href={PAGE_COPY.primaryAction.href}>
              {PAGE_COPY.primaryAction.label}
            </Link>
          </div>
        </header>

        <section className="surface overflow-hidden shadow-[var(--shadow-4)]">
          <div className="border-b border-[var(--color-border-subtle)] px-6 py-5 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <span className="section-label">{PAGE_COPY.title}</span>
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-semibold text-[var(--color-text)] lg:text-3xl">
                    {slide.title}
                  </h1>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {slide.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-neutral">{PAGE_COPY.keyboardHint}</span>
                <span className="meta">{`${currentSlide + 1} / ${INTRO_SLIDES.length}`}</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-teal))] transition-[width] duration-300"
                style={{ width: `${((currentSlide + 1) / INTRO_SLIDES.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex min-h-[720px] flex-col justify-between gap-8 px-6 py-8 lg:px-8 lg:py-10">
            <div key={slide.id} className="flex-1">
              {renderSlideContent(slide)}
            </div>

            <div className="flex flex-col gap-5 border-t border-[var(--color-border-subtle)] pt-6">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {INTRO_SLIDES.map((introSlide, slideIndex) => {
                  const isActive = slideIndex === currentSlide;

                  return (
                    <button
                      aria-current={isActive}
                      aria-label={`${introSlide.title} 슬라이드로 이동`}
                      className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
                        isActive
                          ? 'w-8 bg-[var(--color-accent)]'
                          : 'w-2 bg-[var(--color-border-strong)] hover:bg-[var(--color-text-tertiary)]'
                      }`}
                      key={introSlide.id}
                      onClick={() => setCurrentSlide(slideIndex)}
                      type="button"
                    />
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  className="btn-secondary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isFirstSlide}
                  onClick={() => setCurrentSlide((previousSlide) => Math.max(previousSlide - 1, 0))}
                  type="button"
                >
                  이전
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="meta">{slide.label}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {slide.summary}
                  </span>
                </div>

                {isLastSlide ? (
                  <Link className="btn-primary focus-ring" href={PAGE_COPY.primaryAction.href}>
                    {PAGE_COPY.primaryAction.label}
                  </Link>
                ) : (
                  <button
                    className="btn-primary focus-ring"
                    onClick={() =>
                      setCurrentSlide((previousSlide) =>
                        Math.min(previousSlide + 1, INTRO_SLIDES.length - 1),
                      )
                    }
                    type="button"
                  >
                    다음
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
