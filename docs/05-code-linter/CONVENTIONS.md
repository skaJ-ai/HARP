# Project Coding Conventions

> 5단계: 프로젝트별 코딩 규칙
> 루트 CLAUDE.md의 규칙을 기반으로 프로젝트 특화 규칙을 추가/커스터마이즈한다.

---

## Base Rules

이 프로젝트는 루트 `CLAUDE.md`의 모든 규칙을 상속한다:
- Naming: kebab-case 파일, PascalCase 컴포넌트
- Import: 5-group 순서
- Idempotency: 비결정적 패턴 금지
- Export: Named export only

---

## Project-Specific Rules

> 아래는 프로젝트에 맞게 **커스터마이즈** 하는 영역

### API Pattern

```typescript
// 모든 API 호출은 이 패턴을 따른다

// Server Component (서버 사이드)
async function getUsers(): Promise<Result<User[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown' };
  }
}

// Client Component (클라이언트 사이드)
function useUsers() {
  return useSWR<User[]>('/api/users', fetcher);
}
```

### Error Boundary Pattern

```typescript
// app/error.tsx - 각 route segment에 배치
'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <button onClick={reset} type="button">다시 시도</button>
    </div>
  );
}
```

### Form Pattern

```typescript
// Zod schema → Form validation 패턴
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

---

## Customization Checklist

프로젝트 시작 시 아래 항목을 결정하고 이 문서에 기록:

- [ ] API 호출 패턴 (fetch/axios/SWR 설정)
- [ ] 인증 패턴 (JWT/Session/OAuth)
- [ ] 상태 관리 범위 (어떤 데이터를 전역으로 관리할지)
- [ ] 에러 메시지 언어 (한국어/영어/다국어)
- [ ] 로깅 전략 (console/외부 서비스)
- [ ] 테스트 전략 (단위/통합/E2E 범위)

---

## Rule Override Process

CLAUDE.md의 규칙을 프로젝트 수준에서 변경해야 할 때:

1. 이 문서에 변경 사항과 **이유** 기록
2. ADR(Architecture Decision Record) 작성
3. 해당 규칙의 ESLint 설정 변경
4. 팀 리뷰 후 적용
