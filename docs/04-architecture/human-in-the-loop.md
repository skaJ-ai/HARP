# Human-in-the-Loop (HITL) Design Patterns

> 4단계: AI 시스템에서 인간 검토 구조를 설계하는 패턴
> 할루시네이션 방지, 감사 로그, 에스컬레이션 포인트

---

## 핵심 원칙

1. **AI는 제안하고, 인간이 결정한다**: 크리티컬 액션은 반드시 인간 승인 필요
2. **투명한 경로**: 입력 → 출력의 모든 경로가 추적 가능해야 한다
3. **실패 안전**: AI가 확신 없을 때는 인간에게 에스컬레이션

---

## Pattern 1: Approval Gate (승인 게이트)

```
[AI 작업] → [결과 생성] → 🚪 [인간 검토] → [승인/반려] → [적용]
```

**적용 시점**: 데이터 변경, 외부 통신, 비용 발생 작업
**구현**: 상태 머신에 `pending_approval` 상태 추가

---

## Pattern 2: Confidence Threshold (확신 임계값)

```
if (confidence >= 0.95) → 자동 실행
if (0.70 <= confidence < 0.95) → 인간 확인 요청
if (confidence < 0.70) → 인간에게 완전 위임
```

**적용 시점**: 분류, 추천, 자동 응답 시스템
**구현**: 모델 출력에 confidence score 포함

---

## Pattern 3: Audit Trail (감사 추적)

모든 AI 결정에 대해 기록:

```typescript
interface AuditEntry {
  timestamp: string;      // ISO 8601
  action: string;         // 수행한 액션
  input: unknown;         // 입력 데이터 (PII 마스킹)
  output: unknown;        // 출력 결과
  model: string;          // 사용 모델
  confidence: number;     // 확신도
  reviewedBy?: string;    // 검토자 (있는 경우)
  decision?: 'approved' | 'rejected' | 'auto';
}
```

---

## Pattern 4: Escalation Ladder (에스컬레이션 사다리)

| Level | Condition | Action |
|-------|-----------|--------|
| L0 | 정상 범위 내 | AI 자동 처리 |
| L1 | 낮은 확신도 | 담당자에게 알림 |
| L2 | 규칙 위반 감지 | 팀 리드에게 에스컬레이션 |
| L3 | 크리티컬 이슈 | 즉시 정지, 관리자 개입 |

---

## Pattern 5: Feedback Loop (피드백 루프)

```
[AI 출력] → [인간 평가] → [피드백 기록] → [규칙 업데이트] → [AI 개선]
```

피드백을 하네스(CLAUDE.md, 린터 규칙)에 반영하여 같은 실수가 반복되지 않도록 한다.
이것이 하네스 엔지니어링의 핵심 가치: **실수를 시스템으로 차단**.

---

## Checklist: HITL 설계 시

- [ ] 자동 실행 범위가 명확히 정의되었는가?
- [ ] 인간 승인이 필요한 액션이 식별되었는가?
- [ ] 감사 로그가 모든 AI 결정을 기록하는가?
- [ ] 에스컬레이션 경로가 정의되었는가?
- [ ] 피드백이 하네스에 반영되는 프로세스가 있는가?
