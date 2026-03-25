# Harness Engineering Framework

> 어떤 AI 모델을 써도 동일한 구조·품질의 코드가 나오도록 강제하는 프레임워크

## What is Harness Engineering?

**하네스(Harness)**란 AI 에이전트의 출력을 제어하는 구조적 장치입니다.
프롬프트 엔지니어링에만 의존하는 것이 아니라, **시스템적으로 AI의 출력 방향을 강제**합니다.

```
앞단(Front Guard)          뒷단(Back Guard)
CLAUDE.md                  Evaluation Criteria
ESLint Rules        +      Scoring Rubric        = 멱등성(Idempotency)
Git Hooks                  Monitoring
Naming Conventions         Feedback Loop
```

## Quick Start

```bash
# 1. Clone
git clone https://github.com/skaJ-ai/Harness.git
cd Harness

# 2. Install
npm install

# 3. Verify harness
npm run harness:check

# 4. Start development
npm run dev
```

## Usage: 새 프로젝트에 적용

1. 이 리포를 clone 또는 복사
2. `CLAUDE.md`를 프로젝트에 맞게 커스터마이즈
3. `docs/` 템플릿으로 6단계 프로세스 진행
4. 개발 시 `npm run harness:check`로 앞단 검증
5. 작업 완료 후 Back Guard 평가 수행

## 6-Step Process

| Step | Phase | Template |
|------|-------|----------|
| 1 | 요구사항 수집 | `docs/01-requirements/TEMPLATE.md` |
| 2 | 플랜 수립 | `docs/02-plan/TEMPLATE.md` |
| 3 | CPS/PRD 기획 | `docs/03-cps-prd/CPS-TEMPLATE.md` |
| 4 | 아키텍처 설계 | `docs/04-architecture/DDD-TEMPLATE.md` |
| 5 | 코드 + 린터 | `docs/05-code-linter/CONVENTIONS.md` |
| 6 | 평가 | `docs/06-evaluation/SCORING-RUBRIC.md` |

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run harness:check` | 앞단(Front Guard) 전체 검사 (ESLint + Prettier + TypeScript) |
| `npm run harness:fix` | 자동 수정 가능한 위반 사항 수정 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier 포맷팅 |
| `npm run typecheck` | TypeScript 타입 검사 |

## Key Files

| File | Role |
|------|------|
| `CLAUDE.md` | **Primary Harness** — AI가 가장 먼저 읽는 규칙 문서 |
| `PROJECT-CONTEXT.md` | 프로젝트 전체 맥락 (LLM 핸드오프용) |
| `TODO.md` | 남은 작업 목록 |
| `.harness/back-guard/eval-criteria.json` | 평가 기준 (JSON) |
| `eslint.config.mjs` | 멱등성 강제 린터 설정 |
| `src/components/ui/button.tsx` | 하네스 규칙 준수 참조 컴포넌트 |

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: Zustand (global), useState (local)
- **Data Fetching**: SWR (client), async (server)
- **Validation**: Zod
- **Linting**: ESLint v9 (flat config) + Prettier
- **Document Pipeline**: Typst (MD → PDF)

## Credits

Based on the Harness Engineering methodology presented by:
- **김지운** (FDE, SpaceWhy/DIO)
- **황현태** (CEO, SpaceWhy)
- **빌더 조슈** (Builder Josh) — [YouTube](https://www.youtube.com/@builderjoshkim)

Additional references:
- [Toss Tech — Harness for Team Productivity](https://toss.tech/article/harness-for-team-productivity)
- [Channel.io — What is Harness?](https://channel.io/ko/blog/articles/what-is-harness-2611ddf1)

## License

MIT
