# Domain: [DOMAIN_NAME]

> Domain Layer 하네스 - 이 도메인에 특화된 규칙을 정의합니다.
> Global Layer(루트 CLAUDE.md)를 상속하며, 여기서 정의한 규칙이 우선합니다.

## Bounded Context

### 이 도메인이 소유하는 것
- [엔티티, 로직, 데이터 설명]

### 이 도메인이 소유하지 않는 것
- [다른 도메인에 속하는 것]

## Ubiquitous Language (도메인 용어)

| 용어 | 정의 | 사용 예시 |
|------|------|-----------|
| | | |

## Domain Types

```typescript
// 이 도메인의 핵심 타입 정의
interface [Entity] {
  id: string;
  // ...
}
```

## Domain-Specific Rules

### Global과 다른 점
- [Global 규칙 대비 예외나 추가 규칙]

### Dependencies
| 의존 대상 | 방향 | 설명 |
|-----------|------|------|
| [다른 도메인] | 단방향/양방향 | [이유] |

### Forbidden Dependencies
- [절대 의존하면 안 되는 도메인/모듈]

## Data Flow

```
[입력] → [처리] → [출력]
```
