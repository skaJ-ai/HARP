import Link from 'next/link';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  isTeal?: boolean;
}

const FEATURES: FeatureCard[] = [
  {
    icon: 'dataset',
    title: 'Automated Synthesis',
    description:
      'Instantly aggregate data from disparate HRIS, payroll, and LMS systems into a single, cohesive narrative.',
    linkText: 'Explore module',
  },
  {
    icon: 'trending_up',
    title: 'Predictive Retention',
    description:
      'Identify flight risks before they happen with our neural flight-risk scoring, trained on industry-specific benchmarks.',
    linkText: 'View predictions',
    isTeal: true,
  },
  {
    icon: 'architecture',
    title: 'Strategic Planning',
    description:
      'Simulate hiring scenarios and budget impacts in real-time. Turn financial goals into workforce requirements.',
    linkText: 'Start planning',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-text)] selection:bg-[var(--color-teal-light)]">
      {/* Header */}
      <header className="bg-[var(--color-bg-elevated)]/80 fixed top-0 z-50 w-full border-b border-[var(--color-border-subtle)] py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
              <span className="font-bold">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              HARP
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:text-[var(--color-accent)]"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:text-[var(--color-accent)]"
              href="#solutions"
            >
              Solutions
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
              href="/login"
            >
              Login
            </Link>
            <Link className="btn-teal px-5 py-2.5 text-sm shadow-sm" href="/signup">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-teal-light)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-teal)]">
              <span>✦</span> The Future of HR
            </div>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-accent)] md:text-6xl lg:text-7xl">
              HR Reporting, <br />
              <span className="text-[var(--color-teal)]">Refined</span> by AI
            </h1>
            <p className="max-w-lg text-lg font-medium leading-relaxed text-[var(--color-text-secondary)]">
              Turn raw data into strategic insights in seconds. Built for the modern enterprise to
              navigate workforce complexity with ease.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                className="btn-teal shadow-[var(--color-teal)]/20 flex items-center gap-2 px-8 py-4 text-base shadow-lg"
                href="/signup"
              >
                Get Started <span>→</span>
              </Link>
              <Link
                className="btn-secondary flex items-center gap-2 px-8 py-4 text-base"
                href="/workspace"
              >
                <span>▶</span> Open Workspace
              </Link>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -right-4 -top-8 z-20 hidden md:block">
              <div className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
                <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-teal)]"></span>
                  HARP: AI Report Platform
                </p>
              </div>
            </div>
            {/* Abstract visual placeholder reflecting Stitch's hero style */}
            <div className="absolute -inset-10 opacity-40 blur-3xl transition duration-700 group-hover:opacity-60">
              <div className="h-full w-full rounded-[3rem] bg-gradient-to-tr from-[var(--color-accent-light)] to-[var(--color-teal-light)]"></div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-8 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
              <div className="flex flex-col gap-4">
                <div className="h-4 w-1/3 rounded bg-[var(--color-border-subtle)]"></div>
                <div className="h-32 rounded bg-[var(--color-bg-sunken)] p-4">
                  <div className="h-3 w-3/4 rounded bg-[var(--color-border-subtle)]"></div>
                  <div className="mt-3 h-3 w-1/2 rounded bg-[var(--color-border-subtle)]"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-accent-light)]/30 h-24 rounded"></div>
                  <div className="bg-[var(--color-teal-light)]/30 h-24 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" id="features">
          <div className="mb-20 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-accent)] md:text-5xl">
              Intelligence in every byte
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              HARP eliminates the manual toil of data extraction, allowing you to focus on what
              matters: your people.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <div className="workspace-card group flex flex-col" key={i}>
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:text-white ${feature.isTeal ? 'bg-[var(--color-teal-light)] text-[var(--color-teal)] group-hover:bg-[var(--color-teal)]' : 'bg-[var(--color-accent-light)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]'}`}
                >
                  <span className="font-bold">✦</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-text)]">{feature.title}</h3>
                <p className="mb-8 flex-1 leading-relaxed text-[var(--color-text-secondary)]">
                  {feature.description}
                </p>
                <div
                  className={`flex cursor-pointer items-center gap-2 text-sm font-bold transition-all hover:gap-3 ${feature.isTeal ? 'text-[var(--color-teal)]' : 'text-[var(--color-accent)]'}`}
                >
                  {feature.linkText} <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Asymmetric CTA Section */}
        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-[2rem] bg-[var(--color-accent)] p-12 md:flex-row md:p-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-accent-light)_0%,_transparent_60%)] opacity-20"></div>
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h2 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl">
                Ready to lead with data?
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-white/80">
                Join over 500 enterprises transforming their human resources from a cost center to a
                strategic engine.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <Link
                  className="btn-teal shadow-[var(--color-teal)]/20 px-10 py-4 text-base shadow-xl"
                  href="/signup"
                >
                  Start Free Trial
                </Link>
                <Link
                  className="rounded-lg border border-white/30 px-10 py-4 text-base font-bold text-white transition-all hover:bg-white/10"
                  href="/login"
                >
                  Login to Workspace
                </Link>
              </div>
            </div>

            {/* Decorative element mimicking the Stitch design */}
            <div className="relative z-10 hidden w-72 lg:block">
              <div className="rotate-3 rounded-xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-teal)]"></div>
                  <div className="h-4 w-32 rounded-full bg-white/20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full rounded-full bg-white/15"></div>
                  <div className="h-2 w-4/5 rounded-full bg-white/15"></div>
                  <div className="h-2 w-5/6 rounded-full bg-white/15"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-sunken)] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              HARP
            </span>
          </div>
          <p className="text-sm font-medium tracking-wide text-[var(--color-text-tertiary)]">
            © 2024 HARP AI HR Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
