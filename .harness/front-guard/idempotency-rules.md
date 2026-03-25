# Idempotency Rules

> Front Guard: AI가 생성하는 코드의 멱등성을 보장하기 위한 패턴 가이드

## 멱등성(Idempotency)이란?

> 같은 입력(요구사항 + 하네스 규칙)을 주면, **어떤 AI 모델이든 구조적으로 동일한 코드**를 생산한다.

이것이 하네스 엔지니어링의 궁극적 목표이다.

## 비결정적(Non-deterministic) 패턴 금지

### 1. 시간 의존 코드

```typescript
// BAD: 실행 시마다 다른 결과
const timestamp = Date.now();
const now = new Date();

// GOOD: 서버에서 주입받은 타임스탬프 사용
function OrderCard({ createdAt }: { createdAt: string }) {
  const formattedDate = formatDate(createdAt);
  return <time dateTime={createdAt}>{formattedDate}</time>;
}
```

### 2. 랜덤 값

```typescript
// BAD: 매번 다른 키 생성
const id = Math.random().toString(36);
const key = `item-${Math.random()}`;

// GOOD: 데이터 기반 결정적 식별자
const id = crypto.randomUUID(); // 서버 사이드에서만, 저장 목적
const key = `item-${item.id}`;  // 데이터 ID 기반
```

### 3. 인라인 함수

```typescript
// BAD: JSX 내 익명 함수 (구조가 AI마다 달라짐)
<button onClick={() => setCount(count + 1)}>Click</button>

// GOOD: 명명된 핸들러 (일관된 구조)
const handleIncrement = () => {
  setCount((prev) => prev + 1);
};
return <button onClick={handleIncrement}>Click</button>;
```

### 4. 조건부 Import

```typescript
// BAD: 런타임 조건부 import
if (process.env.NODE_ENV === 'development') {
  const { devTools } = await import('./dev-tools');
}

// GOOD: 항상 최상단에서 import
import { devTools } from './dev-tools';
// 사용 시 조건 분기
if (process.env.NODE_ENV === 'development') {
  devTools.init();
}
```

## 결정적(Deterministic) 패턴 강제

### 1. One Pattern Per Concern

하나의 문제에 대해 **하나의 해결 패턴**만 존재해야 한다:

| Concern | 유일한 패턴 | 금지 대안 |
|---------|------------|----------|
| 전역 상태 | Zustand store | Redux, Context API로 상태 관리 |
| 로컬 상태 | useState | useReducer (복잡한 경우에만 예외) |
| 서버 데이터 페칭 | Server Component async | getServerSideProps, API route |
| 클라이언트 데이터 | SWR | React Query, fetch in useEffect |
| 스타일링 | Tailwind CSS | CSS Modules, styled-components |
| 폼 검증 | Zod schema | Yup, 수동 검증 |
| CN 유틸리티 | clsx | classnames, template literal |

### 2. Explicit Over Implicit

```typescript
// BAD: 암묵적 타입 추론
const items = [];
const config = {};

// GOOD: 명시적 타입 선언
const items: UserItem[] = [];
const config: AppConfig = { theme: 'light', locale: 'ko' };
```

### 3. Canonical State Shape

상태 객체의 키는 항상 알파벳 순으로 정렬:

```typescript
// BAD: 키 순서가 일관되지 않음
const state = { name: '', age: 0, email: '' };

// GOOD: 알파벳 순 정렬
const state = { age: 0, email: '', name: '' };
```

### 4. Predictable Error Handling

```typescript
// 모든 async 함수는 동일한 에러 처리 패턴을 따른다
type Result<T> = { success: true; data: T } | { success: false; error: string };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

## ESLint Enforcement

```javascript
// no-restricted-syntax 규칙으로 멱등성 위반 차단
{
  'no-restricted-syntax': ['error',
    {
      selector: 'CallExpression[callee.object.name="Date"][callee.property.name="now"]',
      message: 'Date.now() is non-deterministic. Use server-provided timestamps.',
    },
    {
      selector: 'NewExpression[callee.name="Date"]',
      message: 'new Date() is non-deterministic in render scope. Use server-provided timestamps.',
    },
    {
      selector: 'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
      message: 'Math.random() is non-deterministic. Use data-based identifiers.',
    },
    {
      selector: 'ExportDefaultDeclaration',
      message: 'Default exports are forbidden. Use named exports for deterministic imports.',
    },
  ],
}
```
