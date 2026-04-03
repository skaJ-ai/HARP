import Link from 'next/link';

interface FeatureCard {
  description: string;
  eyebrow: string;
  isTeal?: boolean;
  title: string;
}

interface ComparisonRow {
  feature: string;
  claude: string;
  gauss: string;
  harp: string;
}

const FEATURES: FeatureCard[] = [
  {
    description:
      '인터뷰 답변과 근거자료를 넣으면 템플릿 기반의 구조화된 보고서 초안이 나옵니다. 프롬프트를 고민할 필요 없이, 질문에 답하면 됩니다.',
    eyebrow: '핵심 가치',
    title: '자료 기반 보고서 생성',
  },
  {
    description:
      '같은 워크스페이스에 자료와 산출물이 계속 쌓입니다. 다음 보고서를 쓸 때 이전 산출물을 자동으로 참조해 톤과 구조를 유지합니다.',
    eyebrow: '차별점',
    isTeal: true,
    title: '쌓일수록 정확해지는 작업공간',
  },
  {
    description:
      '사내 LLM을 사용하고, 모든 데이터는 내 워크스페이스 안에만 존재합니다. 외부 서버로 전송되지 않습니다.',
    eyebrow: '보안',
    title: 'Private-first 설계',
  },
];

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    claude: '대화 끝나면 휘발',
    feature: '자료 누적',
    gauss: '매번 새 대화',
    harp: '워크스페이스에 영구 누적',
  },
  {
    claude: '프롬프트에 의존',
    feature: '구조화된 보고서',
    gauss: '자유 형식',
    harp: '템플릿 기반 섹션별 생성',
  },
  {
    claude: '불가',
    feature: '이전 산출물 참조',
    gauss: '불가',
    harp: '같은 유형 자동 참조',
  },
  {
    claude: '없음',
    feature: '근거 추적',
    gauss: '없음',
    harp: '섹션별 confidence + 근거 라벨',
  },
  {
    claude: '외부 전송 필요',
    feature: '사내망 운영',
    gauss: '사내망',
    harp: '사내 LLM 직접 연결',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-text)] selection:bg-[var(--color-teal-light)]">
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
              주요 기능
            </Link>
            <Link
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:text-[var(--color-accent)]"
              href="#comparison"
            >
              왜 HARP인가
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
              href="/login"
            >
              로그인
            </Link>
            <Link className="btn-teal px-5 py-2.5 text-sm shadow-sm" href="/signup">
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-teal-light)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-teal)]">
              <span>✦</span> HR AI Report Platform
            </div>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-accent)] md:text-6xl lg:text-7xl">
              자료를 넣으면
              <br />
              <span className="text-[var(--color-teal)]">보고서</span>가 나옵니다
            </h1>
            <p className="max-w-lg text-lg font-medium leading-relaxed text-[var(--color-text-secondary)]">
              인터뷰 답변과 근거자료를 쌓으면 AI가 구조화된 초안을 만들어줍니다. 쓸수록 이전
              산출물을 참조해 품질이 올라갑니다.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                className="btn-teal shadow-[var(--color-teal)]/20 flex items-center gap-2 px-8 py-4 text-base shadow-lg"
                href="/signup"
              >
                시작하기 <span>→</span>
              </Link>
              <Link
                className="btn-secondary flex items-center gap-2 px-8 py-4 text-base"
                href="/workspace"
              >
                작업공간 열기
              </Link>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -right-4 -top-8 z-20 hidden md:block">
              <div className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
                <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-teal)]" />
                  사내 LLM 연결
                </p>
              </div>
            </div>
            <div className="absolute -inset-10 opacity-40 blur-3xl transition duration-700 group-hover:opacity-60">
              <div className="h-full w-full rounded-[3rem] bg-gradient-to-tr from-[var(--color-accent-light)] to-[var(--color-teal-light)]" />
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-8 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-teal)]" />
                  <div className="h-3 w-24 rounded bg-[var(--color-border-subtle)]" />
                  <div className="ml-auto h-5 w-16 rounded-full bg-[var(--color-teal-light)]" />
                </div>
                <div className="rounded-lg bg-[var(--color-bg-sunken)] p-4">
                  <div className="mb-2 h-3 w-1/3 rounded bg-[var(--color-border-subtle)]" />
                  <div className="space-y-2">
                    <div className="h-2.5 w-full rounded bg-[var(--color-border-subtle)]" />
                    <div className="h-2.5 w-4/5 rounded bg-[var(--color-border-subtle)]" />
                    <div className="h-2.5 w-2/3 rounded bg-[var(--color-border-subtle)]" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[var(--color-accent-light)]/30 flex flex-col gap-2 rounded-lg p-3">
                    <div className="bg-[var(--color-accent)]/20 h-2 w-2/3 rounded" />
                    <div className="bg-[var(--color-accent)]/10 h-6 w-full rounded" />
                  </div>
                  <div className="bg-[var(--color-teal-light)]/30 flex flex-col gap-2 rounded-lg p-3">
                    <div className="bg-[var(--color-teal)]/20 h-2 w-2/3 rounded" />
                    <div className="bg-[var(--color-teal)]/10 h-6 w-full rounded" />
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-[var(--color-bg-sunken)] p-3">
                    <div className="h-2 w-2/3 rounded bg-[var(--color-border-subtle)]" />
                    <div className="bg-[var(--color-border-subtle)]/50 h-6 w-full rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" id="features">
          <div className="mb-20 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-accent)] md:text-5xl">
              ChatGPT에 복붙하던 시간,
              <br />
              HARP가 대신합니다
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              질문에 답하고, 자료를 붙여 넣으면 됩니다. 나머지는 HARP가 합니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article className="workspace-card group flex flex-col gap-4" key={feature.title}>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:text-white ${feature.isTeal ? 'bg-[var(--color-teal-light)] text-[var(--color-teal)] group-hover:bg-[var(--color-teal)]' : 'bg-[var(--color-accent-light)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]'}`}
                >
                  <span className="font-bold">✦</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="meta">{feature.eyebrow}</span>
                  <h3 className="text-xl font-bold text-[var(--color-text)]">{feature.title}</h3>
                </div>
                <p className="flex-1 leading-relaxed text-[var(--color-text-secondary)]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" id="comparison">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-accent)] md:text-5xl">
              왜 HARP인가
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              사내 LLM(GAUSS)이나 시중 AI(Claude, ChatGPT)로도 보고서를 쓸 수 있습니다.
              <br />
              하지만 자료가 쌓이고 참조되는 건 HARP뿐입니다.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--color-border)]">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]">
                    기능
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--color-text-secondary)]">
                    GAUSS (사내 LLM)
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--color-text-secondary)]">
                    Claude / ChatGPT
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-[var(--color-accent)]">
                    HARP
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr className="border-b border-[var(--color-border-subtle)]" key={row.feature}>
                    <td className="px-4 py-4 text-sm font-semibold text-[var(--color-text)]">
                      {row.feature}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-[var(--color-text-secondary)]">
                      {row.gauss}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-[var(--color-text-secondary)]">
                      {row.claude}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-[var(--color-teal)]">
                      {row.harp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-[2rem] bg-[var(--color-accent)] p-12 md:flex-row md:p-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-accent-light)_0%,_transparent_60%)] opacity-20" />
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h2 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl">
                보고서, 이제 쌓아가세요
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-white/80">
                자료를 넣고 질문에 답하면 구조화된 초안이 나옵니다. 다음 보고서는 이번 것을 참고해
                더 빠르게 완성됩니다.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <Link
                  className="btn-teal shadow-[var(--color-teal)]/20 px-10 py-4 text-base shadow-xl"
                  href="/signup"
                >
                  무료로 시작하기
                </Link>
                <Link
                  className="rounded-lg border border-white/30 px-10 py-4 text-base font-bold text-white transition-all hover:bg-white/10"
                  href="/login"
                >
                  로그인
                </Link>
              </div>
            </div>
            <div className="relative z-10 hidden w-72 lg:block">
              <div className="rotate-3 rounded-xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-teal)]" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-24 rounded-full bg-white/20" />
                    <div className="h-2 w-16 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full rounded-full bg-white/15" />
                  <div className="h-2 w-4/5 rounded-full bg-white/15" />
                  <div className="h-2 w-5/6 rounded-full bg-white/15" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="bg-[var(--color-teal)]/40 h-5 w-12 rounded-full" />
                  <div className="h-5 w-16 rounded-full bg-white/10" />
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
            HARP AI HR Report Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
