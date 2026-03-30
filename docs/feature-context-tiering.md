# Feature Design: 컨텍스트 티어링 (Context Tiering)

> **문서 목적**: 구현 LLM이 컨텍스트 티어링을 구현하기 위한 설계 스키마.
> **작성일**: 2026-03-29
> **리서치 근거**: Mem0 Progressive Disclosure 패턴 + Context Engineering의 3-tier 원칙
> **변경 파일**: 2개 (서비스 1, 프롬프트 구조 1)

---

## 0. 현재 상태 분석

### 생성 프롬프트에 들어가는 컨텍스트 (deliverables/service.ts)

```
[문서 제목] sessionTitle

[현재 세션 대화 기록]         ← Tier 1 (이미 있음)
- 담당자: ... / HARP: ...

[현재 세션 근거자료]          ← Tier 1 (이미 있음)
- [자료명 | 타입] 내용

[참고용 이전 동일 유형 산출물]  ← Tier 2 대상 (현재 1건만)
- 이전 산출물 마크다운

[작성 요청]
```

### 쿼리 구조 (deliverables/service.ts:406-420)

```typescript
// 현재: 이전 동일 유형 산출물 1건만 조회
database.select({ sections, title })
  .from(deliverablesTable)
  .where(and(
    eq(workspaceId),
    eq(templateType),
    ne(sessionId),  // 현재 세션 제외
  ))
  .orderBy(desc(updatedAt))
  .limit(1)  // ← 여기가 핵심. 1건만.
```

### 기존 재사용 가능한 함수

`listRecentReferenceDeliverablesByTemplate` (service.ts:222-273) — 이미 `limit` 파라미터를 받음. 하지만 현재 생성 로직에서는 사용하지 않고 인라인 쿼리를 쓴다.

---

## 1. 핵심 설계 결정

### 1.1 3-Tier 컨텍스트 모델

| Tier | 내용 | 주입 방식 | 현재 상태 |
|------|------|----------|----------|
| **1: 현재 세션** | 대화 기록 + 근거자료 | 항상 전량 주입 | ✅ 구현됨 |
| **2: 직전 산출물** | 같은 유형 최근 3건의 sections | 자동 주입, 최신순 축약 | ⚠️ 1건만 |
| **3: 워크스페이스 검색** | 키워드 기반 전체 검색 | 향후 (이번 스코프 아님) | ❌ 미구현 |

**이번 구현 범위: Tier 2를 1건 → 3건으로 확장 + 프롬프트 내 역할 라벨링.**

### 1.2 왜 3건인가

- 1건: 현재 상태. "직전 것만" 참고. 맥락 부족.
- 3건: 최근 3회차 패턴을 볼 수 있음. 반복 보고서(주간 현황, 월별 교육)에서 3건이면 "지난달, 이번 달, 저번 분기" 수준.
- 5건 이상: 토큰 비용 급증. Qwen 컨텍스트 윈도우 고려 시 3건이 안전한 상한.

### 1.3 Tier 2 축약 전략

3건 전체를 마크다운으로 넣으면 토큰 폭발. 축약 규칙:

| 참조 순서 | 포함 내용 | 토큰 예산 |
|----------|----------|----------|
| 1번째 (최신) | 전체 sections 마크다운 | 제한 없음 (현재와 동일) |
| 2번째 | 각 섹션 첫 200자 + section-meta | ~800자 |
| 3번째 | 섹션 제목 목록 + title만 | ~200자 |

이렇게 하면 "최신 것은 상세히, 오래된 것은 구조만" — Context Engineering의 progressive disclosure.

---

## 2. 변경 파일별 스펙

### 2.1 `src/lib/deliverables/service.ts`

#### 변경 A: 참조 산출물 쿼리 확장 (L406-420)

**현재**:
```typescript
.limit(1)
```

**변경**:
```typescript
.limit(3)
```

리턴 타입도 배열로 받아야 하므로:

```typescript
// 현재: latestReferenceRows[0] (단일)
// 변경: referenceRows (배열, 0~3건)
```

#### 변경 B: buildGenerationPromptContext 시그니처 변경 (L116-140)

**현재**:
```typescript
latestReferenceDeliverable:
  | { sections: DeliverableSection[]; title: string; }
  | undefined;
```

**변경**:
```typescript
referenceDeliverables: Array<{
  sections: DeliverableSection[];
  title: string;
}>;
```

#### 변경 C: 프롬프트 구성 변경 (L165-182)

**현재**:
```typescript
const referenceContext = latestReferenceDeliverable
  ? buildDeliverableMarkdown(title, sections)
  : '참고할 이전 동일 유형 산출물 없음';

// ...
'[참고용 이전 동일 유형 산출물]',
referenceContext,
```

**변경**:
```typescript
function buildTieredReferenceContext(
  deliverables: Array<{ sections: DeliverableSection[]; title: string }>
): string {
  if (deliverables.length === 0) {
    return '참고할 이전 동일 유형 산출물 없음';
  }

  const parts: string[] = [];

  // Tier 2-1: 최신 산출물 — 전체 마크다운
  if (deliverables[0]) {
    parts.push(
      `[가장 최근 산출물 — 전체 참고]`,
      buildDeliverableMarkdown(deliverables[0].title, deliverables[0].sections),
    );
  }

  // Tier 2-2: 두 번째 산출물 — 섹션별 요약 (200자)
  if (deliverables[1]) {
    const sectionSummaries = deliverables[1].sections
      .map((s) => `- ${s.name}: ${s.content.slice(0, 200)}${s.content.length > 200 ? '...' : ''}`)
      .join('\n');
    parts.push(
      `\n[이전 산출물 — 요약 참고] ${deliverables[1].title}`,
      sectionSummaries,
    );
  }

  // Tier 2-3: 세 번째 산출물 — 제목과 섹션명만
  if (deliverables[2]) {
    const sectionNames = deliverables[2].sections.map((s) => s.name).join(', ');
    parts.push(
      `\n[과거 산출물 — 구조 참고] ${deliverables[2].title} (섹션: ${sectionNames})`,
    );
  }

  return parts.join('\n');
}
```

**프롬프트 블록 변경**:
```typescript
return [
  `[문서 제목] ${sessionTitle}`,
  '',
  '[현재 세션 대화 기록]',
  conversationTranscript,
  '',
  '[현재 세션 근거자료]',
  sourceContext,
  '',
  '[이전 동일 유형 산출물 — 최근 3건, 상세→구조 순]',  // ← 라벨 변경
  buildTieredReferenceContext(referenceDeliverables),     // ← 함수 호출
  '',
  '[작성 요청]',
  `${template.name} 템플릿 기준으로 초안을 완성해 주세요.`,
  '이전 산출물이 있으면 톤, 구조, 용어를 참고하되 내용은 현재 세션 데이터 기준으로 작성합니다.',  // ← 지시 추가
].join('\n');
```

#### 변경 D: 호출부 수정 (L447-448)

**현재**:
```typescript
buildGenerationPromptContext({
  latestReferenceDeliverable: latestReferenceRows[0],
  // ...
})
```

**변경**:
```typescript
buildGenerationPromptContext({
  referenceDeliverables: referenceRows,
  // ...
})
```

---

## 3. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| Tier 1 (세션 대화 + 소스) | 이미 잘 동작함 |
| Tier 3 (워크스페이스 전체 검색) | 별도 피처. 검색 인프라 필요 |
| `listRecentReferenceDeliverablesByTemplate` 함수 | 이 함수는 세션 상세/캔버스 표시용. 생성 쿼리와는 별도로 유지 |
| generate 프롬프트의 system prompt | `templates/index.ts:324-349`의 생성 시스템 프롬프트는 변경 불필요 |
| DB 스키마 | 쿼리 변경만으로 충분 |

---

## 4. CLAUDE.md 체크리스트

- [ ] `buildTieredReferenceContext`는 모듈 스코프 함수로 선언 (export 불필요, 파일 내부 사용)
- [ ] magic number 없음 — 200자 슬라이스는 `REFERENCE_SUMMARY_MAX_LENGTH = 200` 상수로 추출
- [ ] 기존 `buildDeliverableMarkdown` 재사용 (Tier 2-1에서)
- [ ] 배열 접근 시 옵셔널 체이닝 불필요 — `if (deliverables[1])` 가드로 충분
- [ ] import 변경 없음 — DeliverableSection은 이미 같은 파일 스코프
- [ ] `npm run harness:check` 통과 확인
- [ ] `npm run build` 통과 확인

---

## 5. 구현 순서

1. `deliverables/service.ts` — `buildTieredReferenceContext` 함수 추가
2. `deliverables/service.ts` — `buildGenerationPromptContext` 시그니처 변경 (단일 → 배열)
3. `deliverables/service.ts` — 참조 쿼리 `.limit(1)` → `.limit(3)`
4. `deliverables/service.ts` — 호출부 `latestReferenceRows[0]` → `referenceRows`
5. `npm run harness:check && npm run build`

---

## 6. 검증 방법

컨텍스트 티어링은 프롬프트 변경이라 UI에서 직접 확인이 어렵다. 검증:

1. **동일 유형 산출물이 0건일 때**: "참고할 이전 동일 유형 산출물 없음" 출력 (기존과 동일)
2. **1건일 때**: Tier 2-1만 출력 (전체 마크다운)
3. **2건일 때**: Tier 2-1(전체) + Tier 2-2(요약)
4. **3건 이상일 때**: Tier 2-1(전체) + Tier 2-2(요약) + Tier 2-3(구조만)

서버 로그에 `buildTieredReferenceContext` 결과의 글자 수를 찍어서 확인하는 것을 권장.
