import type { ReactElement } from 'react';

import Link from 'next/link';

interface TemplatePreview {
  badgeClassName: string;
  badgeLabel: string;
  description: string;
  estimatedMinutes: number;
  name: string;
  type: string;
}

const HEADER_COPY = {
  brand: 'HARP',
  primaryAction: {
    href: '/workspace/new',
    label: '새 작업 시작',
  },
  secondaryAction: {
    href: '/login',
    label: '로그인',
  },
  subtitle: 'HR AI Report Platform',
} as const;

const HERO_COPY = {
  headline: '대화만으로 회사 표준 HR 보고서 초안을 만듭니다',
  label: 'HARP',
  primaryAction: {
    href: '/workspace/new',
    label: '새 작업 시작',
  },
  subtitle:
    '유형을 고르고 예시 문서를 붙여넣으면 HARP가 먼저 질문합니다. 없으면 그대로 시작해도 됩니다.',
} as const;

const TEMPLATE_PREVIEWS: TemplatePreview[] = [
  {
    badgeClassName: 'badge-amber',
    badgeLabel: '🔍 인사이트',
    description: '데이터를 해석하고 시사점을 뽑을 때 쓰는 분석 중심 템플릿입니다.',
    estimatedMinutes: 10,
    name: '분석 보고 작성하기',
    type: 'analysis',
  },
  {
    badgeClassName: 'badge-blue',
    badgeLabel: '→ 미래',
    description: '새로운 걸 제안하거나 검토할 때 쓰는 기획 중심 템플릿입니다.',
    estimatedMinutes: 10,
    name: '기획(안) 작성하기',
    type: 'planning',
  },
  {
    badgeClassName: 'badge-green',
    badgeLabel: '← 과거',
    description: '한 일의 성과를 정리할 때 쓰는 결과 중심 템플릿입니다.',
    estimatedMinutes: 8,
    name: '결과 보고 정리하기',
    type: 'result',
  },
  {
    badgeClassName: 'badge-gray',
    badgeLabel: '● 현재',
    description: '지금 상태를 간결하게 보고할 때 쓰는 현황 중심 템플릿입니다.',
    estimatedMinutes: 5,
    name: '현황 보고 작성하기',
    type: 'status',
  },
];

const ABOUT_LINK_COPY = {
  footerLabel: 'HARP가 뭔가요?',
  href: '/about',
  navLabel: '소개',
} as const;

function renderTemplatePreview(template: TemplatePreview): ReactElement {
  return (
    <article className="doc-card flex h-full flex-col gap-4 p-6" key={template.type}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className={`badge ${template.badgeClassName} w-fit`}>{template.badgeLabel}</span>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">{template.name}</h2>
        </div>
        <span className="badge badge-neutral shrink-0">{`${template.estimatedMinutes}분`}</span>
      </div>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{template.description}</p>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.85),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.7),_transparent_28%),var(--color-bg)] px-6 py-6 lg:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="surface flex flex-col gap-4 px-6 py-4 shadow-[var(--shadow-1)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              {HEADER_COPY.brand}
            </span>
            <p className="text-sm text-[var(--color-text-secondary)]">{HEADER_COPY.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
              href={ABOUT_LINK_COPY.href}
            >
              {ABOUT_LINK_COPY.navLabel}
            </Link>
            <Link className="btn-secondary focus-ring" href={HEADER_COPY.secondaryAction.href}>
              {HEADER_COPY.secondaryAction.label}
            </Link>
            <Link className="btn-primary focus-ring" href={HEADER_COPY.primaryAction.href}>
              {HEADER_COPY.primaryAction.label}
            </Link>
          </div>
        </header>

        <section className="surface px-8 py-10 text-center shadow-[var(--shadow-4)] lg:px-10 lg:py-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
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

        <section className="grid gap-4 lg:grid-cols-2">
          {TEMPLATE_PREVIEWS.map(renderTemplatePreview)}
        </section>

        <div className="flex justify-center">
          <Link
            className="text-sm text-[var(--color-text-tertiary)] transition hover:text-[var(--color-accent)]"
            href={ABOUT_LINK_COPY.href}
          >
            {`${ABOUT_LINK_COPY.footerLabel} >`}
          </Link>
        </div>
      </div>
    </main>
  );
}
