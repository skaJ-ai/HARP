# Global Context Layer

> 이 파일은 프로젝트 전체에 적용되는 최상위 컨텍스트입니다.
> 새 프로젝트에 하네스를 적용할 때 이 파일을 기반으로 루트 CLAUDE.md를 생성합니다.

## Project Identity

- **Project Name**: [프로젝트명]
- **Tech Stack**: Next.js 15+ / TypeScript / Tailwind CSS / Zustand / SWR
- **Target**: [서비스 대상 설명]

## Global Constraints

### Security
- 환경 변수는 반드시 `.env.local`에 저장. 코드에 하드코딩 금지
- API 키, 시크릿은 서버 사이드에서만 접근 (`NEXT_PUBLIC_` 접두사 최소화)
- 사용자 입력은 항상 Zod schema로 검증

### Performance
- 이미지는 반드시 `next/image` 사용
- 폰트는 `next/font` 사용
- 불필요한 `'use client'` 금지. 서버 컴포넌트 우선

### Accessibility
- 시맨틱 HTML 사용 (`div` 남용 금지)
- 인터랙티브 요소에 ARIA 레이블 제공
- 키보드 네비게이션 지원

### Error Handling
- 모든 비동기 작업은 Result 패턴 사용
- 사용자에게 보여주는 에러는 한국어 메시지
- 개발자용 에러는 영어 로그

## This Layer's Scope

이 Global Layer는 아래에 의해 **오버라이드** 될 수 있다:
1. `src/domains/<name>/CLAUDE.md` (Domain Layer)
2. 각 디렉토리의 `CLAUDE.md` (Local Layer)

충돌 시 우선순위: **Local > Domain > Global**
