# Feature Design: 아웃라인 프리뷰 (Outline Preview)

> **문서 목적**: 구현 LLM이 생성 전 아웃라인 프리뷰 기능을 구현하기 위한 설계 스키마.
> **작성일**: 2026-03-30
> **리서치 근거**: Synapsy Write 아웃라인→초안 2단계 패턴 + "검토 후 생성" 신뢰 설계 원칙
> **변경 파일**: 1개 (캔버스 UI 1)

---

## 0. 현재 상태 분석

### 생성 플로우 (session-canvas.tsx:283-315)

```
[현재]
사용자가 "정리하기" 버튼 클릭
  → handleGenerateClick() 즉시 호출
    → POST /api/sessions/{id}/generate
      → 전체 문서 생성
        → 결과 표시
```

**문제**: 생성은 비가역적 행동(LLM 호출 비용 + 시간)인데, 사용자가 "지금 무엇이 생성될지" 확인 없이 바로 실행됨.

### 캔버스 섹션 데이터 (이미 존재)

```typescript
// currentSession.canvas.sections — 인터뷰 중 누적된 데이터
interface SessionCanvasSection {
  content: string;       // 인터뷰 중 수집된 내용 요약
  description: string;   // 템플릿 정의 설명
  name: string;          // 섹션명 ("배경", "현행 제도 분석", ...)
  required: boolean;
  status: 'complete' | 'empty';
}
```

이 데이터는 캔버스 탭에서 이미 보여주고 있지만, **생성 직전 확인용으로는 사용되지 않는다.**

### 준비도 관련 데이터 (이미 존재)

```typescript
currentSession.readinessPercent  // 0-100
currentSession.canGenerate       // boolean (모든 체크리스트 true)
currentSession.checklist         // Record<string, boolean>
```

---

## 1. 핵심 설계 결정

### 1.1 프리뷰 방식: 오버레이 vs 모달 vs 인라인

| 방식 | 장점 | 단점 |
|------|------|------|
| **모달 오버레이** | 집중도 높음, 명확한 확인 단계 | 무겁게 느껴질 수 있음 |
| 별도 페이지 | 완전한 분리 | 과도한 설계, 복잡도 증가 |
| 인라인 상태 전환 | 가벼움 | 기존 콘텐츠와 중복 가능 → 숨김 처리로 해결 |

**결정: 인라인 상태 전환 (배타적 모드)**.

이유:
- 캔버스 영역 안에서 "프리뷰 모드" ↔ "일반 모드" 배타적 전환 (동시 표시 아님)
- 프리뷰 모드일 때 기존 캔버스 콘텐츠는 숨김 → 프리뷰 패널만 표시
- "정리하기" 클릭 → 캔버스가 프리뷰 모드로 전환 → "이대로 정리합니다" 클릭 → 실제 생성

### 1.2 프리뷰에서 보여줄 정보

| 영역 | 내용 |
|------|------|
| 헤더 | "생성 전 확인" 라벨 + 준비도 표시 |
| 섹션 목록 | 각 섹션명 + 수집된 content 요약 + 상태 배지 |
| 경고 영역 | `empty` 상태인 섹션 목록 (있으면) |
| 액션 버튼 | "이대로 정리합니다" (primary) + "더 보충합니다" (secondary) |

### 1.3 프리뷰 진입 조건

기존 "정리하기" 버튼의 동작만 변경:
- **현재**: 클릭 → 즉시 API 호출
- **변경**: 클릭 → 프리뷰 모드 진입 → 확인 클릭 → API 호출

"부족한 채로 정리하기" 버튼도 동일하게 프리뷰를 거친다.

---

## 2. 변경 파일 스펙

### 2.1 `src/components/workspace/session-canvas.tsx`

#### 상태 추가

```typescript
const [isPreviewMode, setIsPreviewMode] = useState(false);
```

#### 핸들러 변경

**현재** `handleGenerateButtonClick` (L317-319):
```typescript
const handleGenerateButtonClick = () => {
  void handleGenerateClick();
};
```

**변경** — 프리뷰 진입 + 확인 + 취소 핸들러:
```typescript
const handleGeneratePreviewOpen = () => {
  setIsPreviewMode(true);
};

const handleGeneratePreviewConfirm = () => {
  setIsPreviewMode(false);
  void handleGenerateClick();
};

const handleGeneratePreviewCancel = () => {
  setIsPreviewMode(false);
};
```

#### 버튼 연결 변경

"정리하기" 버튼과 "부족한 채로 정리하기" 버튼 모두:
```
onClick={handleGenerateButtonClick}
→
onClick={handleGeneratePreviewOpen}
```

#### 프리뷰 UI 렌더링 (캔버스 탭 내부)

`isCanvasTabActive` 블록 최상단에 프리뷰 패널 삽입:

```tsx
{isCanvasTabActive ? (
  <div className="flex flex-col gap-4">
    {isPreviewMode ? (
      <div className="flex flex-col gap-4">
        <div className="rounded-[var(--radius-md)] border-2 border-[var(--color-accent)] bg-[var(--color-accent-light)] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="meta">Preview</p>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                생성 전 확인
              </h3>
            </div>
            <span className={`badge ${readinessBadgeClassName}`}>
              {readinessPercent}% 준비
            </span>
          </div>

          <div className="mb-4 flex flex-col gap-2">
            {currentSession.canvas.sections.map((section) => (
              <div
                className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg)] px-3 py-2"
                key={section.name}
              >
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {section.name}
                  </p>
                  <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                    {section.content.length > 0
                      ? section.content.length > 120
                        ? `${section.content.slice(0, 120)}...`
                        : section.content
                      : '수집된 내용 없음 — 추정으로 작성됩니다'}
                  </p>
                </div>
                <span
                  className={`badge mt-0.5 ${section.status === 'complete' ? 'badge-success' : 'badge-warning'}`}
                >
                  {section.status === 'complete' ? '준비됨' : '추정'}
                </span>
              </div>
            ))}
          </div>

          {currentSession.canvas.sections.some((section) => section.status === 'empty') ? (
            <p className="mb-4 text-sm leading-6 text-[var(--color-warning)]">
              수집되지 않은 섹션은 LLM이 추정으로 작성합니다. 근거가 부족할 수 있습니다.
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <button
              className="btn-secondary"
              onClick={handleGeneratePreviewCancel}
              type="button"
            >
              더 보충합니다
            </button>
            <button
              className="btn-teal focus-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isGenerateSubmitting}
              onClick={handleGeneratePreviewConfirm}
              type="button"
            >
              {isGenerateSubmitting ? '정리 중...' : '이대로 정리합니다'}
            </button>
          </div>
        </div>
      </div>
    ) : null}

    {/* 기존 캔버스 콘텐츠 — 프리뷰 모드에서는 숨김 */}
    {!isPreviewMode ? (
      <>
        {/* ... 기존 에러, 준비도, 최근 초안, 섹션 카드 등 모두 여기 안에 ... */}
      </>
    ) : null}
  </div>
) : null}
```

**중요**: 프리뷰 모드일 때 기존 캔버스 콘텐츠(준비도 카드, 최근 초안 카드, 섹션 카드 리스트)를 모두 숨긴다. 프리뷰 패널과 기존 섹션 카드가 동시에 보이면 사용자가 무엇을 확인해야 하는지 모호해지기 때문이다. 프리뷰 패널이 유일한 콘텐츠로 표시되어야 확인 단계가 명확하다.

#### 프리뷰 내 섹션 content 표시 규칙

| content 길이 | 표시 |
|-------------|------|
| 0 (empty) | "수집된 내용 없음 — 추정으로 작성됩니다" + "추정" 배지 |
| 1~120자 | 전체 표시 + "준비됨" 배지 |
| 121자 이상 | 120자 + "..." + "준비됨" 배지 |

120자로 자르는 이유: 프리뷰는 "무엇이 있는지" 확인용이지 "전체 내용 읽기"용이 아님.
상수로 추출: `PREVIEW_SECTION_CONTENT_MAX_LENGTH = 120`

---

## 3. 변경하지 않는 것

| 항목 | 이유 |
|------|------|
| 생성 API (`/api/sessions/{id}/generate`) | 변경 없음. 프리뷰는 순수 클라이언트 로직 |
| `handleGenerateClick` 함수 | 내부 로직 변경 없음. 호출 시점만 프리뷰 확인 후로 이동 |
| 캔버스 데이터 구조 | `SessionCanvasState`, `SessionCanvasSection` 변경 없음 |
| DB 스키마 | 변경 없음 |
| 인터뷰 프롬프트 | 변경 없음 |
| 다른 탭 (체크리스트·프레임워크, 참고 자료) | 변경 없음 |

---

## 4. CLAUDE.md 체크리스트

- [ ] `isPreviewMode` 상태는 기존 `useState` 선언과 알파벳순 위치
- [ ] `handleGeneratePreviewOpen`, `handleGeneratePreviewConfirm`, `handleGeneratePreviewCancel`은 알파벳순 위치
- [ ] 120자 슬라이스는 `PREVIEW_SECTION_CONTENT_MAX_LENGTH = 120` 상수로 추출
- [ ] JSX 내 인라인 익명 함수 없음
- [ ] 프리뷰 패널은 `isPreviewMode && isCanvasTabActive` 조건에서만 렌더링
- [ ] `npm run harness:check` 통과 확인
- [ ] `npm run build` 통과 확인

---

## 5. 구현 순서

1. `session-canvas.tsx` — `PREVIEW_SECTION_CONTENT_MAX_LENGTH` 상수 추가
2. `session-canvas.tsx` — `isPreviewMode` 상태 추가
3. `session-canvas.tsx` — 3개 핸들러 추가 (`handleGeneratePreviewOpen`, `Confirm`, `Cancel`)
4. `session-canvas.tsx` — 기존 "정리하기" / "부족한 채로 정리하기" 버튼의 `onClick`을 `handleGeneratePreviewOpen`으로 변경
5. `session-canvas.tsx` — 캔버스 탭 내부에 프리뷰 패널 JSX 추가
6. `npm run harness:check && npm run build`

---

## 6. 검증 방법

1. **"정리하기" 클릭** → 캔버스 영역에 프리뷰 패널 표시 확인
2. **프리뷰 패널**에 모든 섹션이 표시되는지 확인 (섹션 수 = 템플릿 섹션 수)
3. **empty 섹션**이 "추정" 배지 + 경고 메시지로 표시되는지 확인
4. **"더 보충합니다" 클릭** → 프리뷰 패널 닫힘, 일반 캔버스로 복귀 확인
5. **"이대로 정리합니다" 클릭** → 프리뷰 닫힘 + 실제 생성 API 호출 확인
6. **"부족한 채로 정리하기" 클릭**도 동일하게 프리뷰를 거치는지 확인

---

## 7. 향후 확장 가능성 (이번 스코프 아님)

| 확장 | 설명 |
|------|------|
| 프리뷰 내 섹션 재정렬 | 드래그&드롭으로 섹션 순서 변경 → 생성 시 반영 |
| 프리뷰 내 메모 추가 | 각 섹션에 "이 부분은 이렇게 써주세요" 지시 추가 |
| 섹션별 생성 | 프리뷰에서 특정 섹션만 선택해 재생성 → 별도 API 필요 (현재 스코프 밖) |

이들은 모두 이번 프리뷰 구조 위에 점진적으로 올릴 수 있다.
