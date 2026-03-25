# Convergence Guide: 발산 → 수렴

> 미팅에서 나온 발산적인 내용을 MECE하게 수렴시키는 가이드

---

## MECE Framework

**MECE** = Mutually Exclusive, Collectively Exhaustive
(상호 배타적이면서 전체를 빠짐없이 포괄)

### Step 1: 원재료 수집

미팅 노트의 모든 포인트를 개별 아이템으로 분리:
```
- "로그인 기능 필요"
- "소셜 로그인도 있으면 좋겠다"
- "관리자가 사용자를 관리할 수 있어야 한다"
- "성능이 빨라야 한다"
- "모바일에서도 잘 되어야 한다"
```

### Step 2: Affinity Mapping (친화도 분류)

유사한 아이템을 그룹으로 묶기:
```
[인증] 로그인, 소셜 로그인
[관리] 사용자 관리
[비기능] 성능, 모바일 반응형
```

### Step 3: MECE 검증

- **Mutually Exclusive**: 각 그룹이 겹치지 않는가?
- **Collectively Exhaustive**: 빠진 아이템이 없는가?

### Step 4: Priority Matrix (우선순위 매트릭스)

```
            Impact High        Impact Low
Effort Low  [Quick Win]        [Fill Later]
Effort High [Strategic]        [Don't Do]
```

| Item | Impact | Effort | Quadrant |
|------|--------|--------|----------|
| | H/M/L | H/M/L | |

---

## Decision Matrix (의사결정 매트릭스)

여러 대안 중 선택해야 할 때:

| Criteria (Weight) | Option A | Option B | Option C |
|-------------------|----------|----------|----------|
| 기술 적합성 (0.3) | ?/5 | ?/5 | ?/5 |
| 구현 난이도 (0.2) | ?/5 | ?/5 | ?/5 |
| 유지보수성 (0.2) | ?/5 | ?/5 | ?/5 |
| 비용 (0.15) | ?/5 | ?/5 | ?/5 |
| 시간 (0.15) | ?/5 | ?/5 | ?/5 |
| **Weighted Total** | ? | ? | ? |

---

## Common Anti-Patterns

| Anti-Pattern | Description | Fix |
|-------------|-------------|-----|
| 범위 불명확 | "다 좋은데 뭘 먼저 할지 모름" | Priority Matrix 적용 |
| 발산만 반복 | "매번 회의하는데 결론이 없음" | 회의 종료 5분 전 합의 사항 정리 강제 |
| 암묵적 합의 | "다들 알겠지" | 합의 사항을 문서에 명시적 기록 |
| 빠진 관점 | "개발만 논의하고 운영은 빠짐" | MECE 체크리스트로 교차 검증 |
