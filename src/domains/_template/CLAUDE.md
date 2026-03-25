# Domain: _template

> 이것은 새 도메인을 생성할 때 복사하여 사용하는 템플릿입니다.
> 사용법: `cp -r src/domains/_template src/domains/your-domain-name`

## Bounded Context

### Owns
- [이 도메인이 소유하는 엔티티와 로직]

### Does NOT Own
- [다른 도메인에 속하는 것]

## Domain Rules

- 이 도메인의 types.ts에 정의된 타입만 사용
- 다른 도메인의 내부 구현에 직접 의존하지 않음
- 도메인 간 통신은 공유 타입(src/types/)을 통해

## Dependencies

| Target Domain | Direction | Reason |
|--------------|-----------|--------|
| shared | Unidirectional | 공통 타입 사용 |
