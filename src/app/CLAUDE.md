# Local Context: app/

> App Router 페이지 디렉토리

## Rules

- 이 디렉토리의 `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`는 **default export 허용** (Next.js 요구사항)
- 그 외 파일은 Global 규칙(named export only) 적용
- 페이지 컴포넌트는 가능한 Server Component로 유지
- 클라이언트 로직이 필요하면 별도 컴포넌트로 분리 후 import
