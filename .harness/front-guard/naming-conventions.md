# Naming Conventions Specification

> Front Guard: 파일명과 코드 네이밍을 하나의 규칙으로 강제하여 멱등성을 확보한다.

## 1. File Naming

### Rules

| Category | Pattern | Regex | Example |
|----------|---------|-------|---------|
| Component | `kebab-case.tsx` | `^[a-z][a-z0-9]*(-[a-z0-9]+)*\.tsx$` | `user-profile-card.tsx` |
| Utility | `kebab-case.ts` | `^[a-z][a-z0-9]*(-[a-z0-9]+)*\.ts$` | `format-date.ts` |
| Type file | `kebab-case.ts` | `^[a-z][a-z0-9]*(-[a-z0-9]+)*\.ts$` | `api-types.ts` |
| Test | `*.test.ts(x)` | `^.+\.test\.tsx?$` | `format-date.test.ts` |
| Style | `kebab-case.css` | `^[a-z][a-z0-9]*(-[a-z0-9]+)*\.css$` | `globals.css` |
| Config | dot-file or kebab-case | - | `.prettierrc.json`, `next.config.ts` |

### Why kebab-case?

kebab-case는 **유일한 표현(canonical representation)**을 가진다:
- `UserProfile` → `user-profile` (PascalCase는 대소문자 모호)
- `userProfile` → `user-profile` (camelCase는 OS 간 차이 발생 가능)
- `user-profile` → `user-profile` (항상 동일)

## 2. Code Naming

### Variable/Function → Component Name Derivation

파일명에서 컴포넌트명을 기계적으로 도출한다:

```
파일명: user-profile-card.tsx
→ 하이픈 분리: ["user", "profile", "card"]
→ 각 단어 첫 글자 대문자: ["User", "Profile", "Card"]
→ 결합: UserProfileCard
```

이 변환은 **역방향도 유일**하다:
```
UserProfileCard → user-profile-card.tsx
```

### Naming Table

| Element | Convention | Derivation Rule |
|---------|------------|-----------------|
| Component | PascalCase | file kebab → PascalCase |
| Props | `{Component}Props` | append "Props" |
| Hook | `use{Feature}` | prefix "use" |
| Context | `{Feature}Context` | append "Context" |
| Provider | `{Feature}Provider` | append "Provider" |
| Store (Zustand) | `use{Feature}Store` | prefix "use", append "Store" |
| Action (Server) | `{verb}{Noun}` | camelCase verb+noun |
| Query | `get{Noun}` | prefix "get" |
| Mutation | `create/update/delete{Noun}` | CRUD prefix |
| Constant | `SCREAMING_SNAKE` | all caps with underscore |
| Enum value | `SCREAMING_SNAKE` | all caps with underscore |
| Type parameter | `T{Name}` | prefix "T" |

## 3. Directory Naming

- 모든 디렉토리: **kebab-case**
- 예외 없음 (Next.js route groups `(group-name)` 포함)

## 4. Violations & Enforcement

위반 시:
1. ESLint `@typescript-eslint/naming-convention` 규칙이 빌드 차단
2. Git pre-commit hook이 커밋 차단
3. AI Self-Evaluation에서 Faithfulness 감점
