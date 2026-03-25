# Domain-Driven Design: [PROJECT NAME]

> 4단계: 도메인 주도 설계
> 개념의 위계 구조를 정의하면 결과물이 필연적인 방향으로 진행된다.

---

## 1. Ubiquitous Language (유비쿼터스 언어)

> 팀 전체가 동일한 용어를 사용한다. 코드, 문서, 대화 모두에서.

| Term (EN) | Term (KO) | Definition | Example |
|-----------|-----------|-----------|---------|
| | | | |

---

## 2. Bounded Contexts (경계 컨텍스트)

```
┌─────────────┐     ┌─────────────┐
│  Context A   │────>│  Context B   │
│             │     │             │
│ [Entities]  │     │ [Entities]  │
└─────────────┘     └─────────────┘
        │
        v
┌─────────────┐
│  Context C   │
│             │
│ [Entities]  │
└─────────────┘
```

| Context | Responsibility | Key Entities | Owner |
|---------|---------------|-------------|-------|
| | | | |

### Context Relationships

| From | To | Type | Description |
|------|----|------|-------------|
| | | Upstream/Downstream | |

---

## 3. Domain Hierarchy (도메인 계층)

```
[Root Domain]
├── [Subdomain A]
│   ├── Entity A-1
│   └── Entity A-2
├── [Subdomain B]
│   ├── Entity B-1
│   ├── Value Object B-1
│   └── Entity B-2
└── [Shared Kernel]
    └── Common Types
```

---

## 4. Aggregates

| Aggregate Root | Contains | Invariants |
|---------------|----------|------------|
| | | [이 집합체가 항상 만족해야 하는 불변 규칙] |

---

## 5. Domain Events

| Event | Trigger | Consumers | Data |
|-------|---------|-----------|------|
| | [언제 발생] | [누가 구독] | [전달 데이터] |

---

## 6. Anti-Corruption Layer (부패 방지 계층)

> 외부 시스템과의 경계에서 도메인 순수성을 보호한다.

| External System | ACL Strategy | Translation |
|----------------|-------------|-------------|
| | Adapter/Facade/Gateway | [외부 → 내부 변환 규칙] |

---

## 7. Directory Mapping

> DDD 도메인 → 파일시스템 매핑

```
src/domains/
├── [context-a]/
│   ├── CLAUDE.md          # Domain Layer harness
│   ├── types.ts           # Domain entities & value objects
│   ├── actions.ts         # Command handlers (mutations)
│   ├── queries.ts         # Query handlers (reads)
│   ├── events.ts          # Domain events
│   └── components/        # Domain-specific UI
├── [context-b]/
│   └── ...
└── shared/
    └── types.ts           # Shared kernel types
```
