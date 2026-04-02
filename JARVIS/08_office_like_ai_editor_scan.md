# HARP용 Office-like AI Editor 스캔

이 문서는 HARP가 장기적으로 지향할 수 있는
**문서/스프레드시트/프레젠테이션 + AI 공동작성 경험**에 대한 레퍼런스 스캔입니다.

핵심 질문:
> HARP 안에서 Word/Excel/PowerPoint처럼 작업하면서,
> AI가 옆 또는 우측에서 즉각 반영되게 할 수 있는가?

결론부터 말하면,
**하나의 오픈소스로 완벽하게 해결되지는 않지만, 조합 가능한 레퍼런스는 충분히 있습니다.**

---

## 1. HARP가 장기적으로 지향할 UX

가장 이상적인 HARP 편집 경험은 다음과 같습니다.

- 좌측: AI 인터뷰 / 지시 / rewrite 요청
- 중앙: 문서 / 표 / 슬라이드 편집기
- 우측: evidence / source / previous asset / trace

AI는 단순히 초안을 던지는 것이 아니라:
- 문단 수정
- 표 생성
- 슬라이드 outline 생성
- tone 변환
- evidence 기반 보강
- section rewrite
를 **즉각 편집면에 반영**해야 합니다.

즉,
HARP의 다음 단계는
**chat + office-like editor + evidence panel** 구조입니다.

---

## 2. 문서(Word-like) 레퍼런스

### A. ONLYOFFICE Docs
#### 왜 중요한가
가장 MS Office 대체재에 가까운 오픈소스/오픈코어 계열입니다.
문서/시트/슬라이드 편집 모두 대응 범위가 넓습니다.

#### HARP에 의미
- office-like editing surface를 붙이고 싶을 때 현실적인 후보
- Word/Excel/PowerPoint 유사 UX 참고 가능

#### 장점
- 문서/표/슬라이드 모두 다룸
- 실제 실무 편집기 성숙도 높음
- 임베드/연동 관점에서 가치 있음

#### 한계
- AI-native 아님
- HARP의 인터뷰/evidence workflow와는 직접 연결되지 않음
- integration 비용 큼

#### 판단
> 편집기 엔진으로 강함. AI 공동작성 UX는 HARP가 따로 설계해야 함.

---

### B. Collabora / LibreOffice Online 계열
#### 왜 중요한가
전통적인 오피스 대체 엔진 레퍼런스입니다.

#### 장점
- 문서/시트/프레젠테이션 편집 가능
- 오피스 호환성 관점에서 참고 가치 있음

#### 한계
- HARP와 UX 결합성은 약함
- AI와 즉시 공동 작성 경험은 거의 없음
- 무겁고 제품 일관성이 떨어질 수 있음

#### 판단
> 편집 엔진 참고용은 되지만, HARP의 AI 제품 UX와는 거리가 있음.

---

## 3. 문서 워크스페이스 레퍼런스

### A. AppFlowy
#### 왜 중요한가
Notion 계열 오픈소스 워크스페이스로,
문서 허브/지식 자산 UX 참고에 좋습니다.

#### HARP에 의미
- promoted asset library
- workspace navigation
- knowledge hub UX

#### 한계
- Word-like office editor라기보다 workspace/document tool
- AI와 실시간 공동작성 오피스 편집은 약함

---

### B. AFFiNE
#### 왜 중요한가
문서 + 화이트보드 + 지식 작업공간 계열로,
AI 협업 UX 감각 참고에 좋습니다.

#### HARP에 의미
- workspace 중심 문서 작업 UX
- structured content와 자유 문서의 혼합 감각

#### 한계
- 실무 오피스 포맷 대응은 약함
- HARP가 필요한 표/슬라이드 편집과는 거리 있음

---

## 4. 스프레드시트(Excel-like) 레퍼런스

### A. Univer
#### 왜 중요한가
HARP가 장기적으로 가장 주목해야 할 오픈소스 축 중 하나입니다.
문서/스프레드시트/슬라이드 방향을 함께 가져가려는 엔진 계열입니다.

#### HARP에 의미
- KPI 편집
- 교육/채용/현황 데이터 테이블 편집
- AI가 즉시 표 반영하는 미래 UX

#### 장점
- office-like collaborative engine 방향성
- HARP의 structured report editing과 잘 맞음

#### 한계
- 실제 통합 난도 확인 필요
- 제품 완성도는 전통 오피스보다 약할 수 있음

#### 판단
> HARP가 장기적으로 office-like core editor를 꿈꾸면 가장 유력한 기술 레퍼런스 중 하나.

---

### B. Luckysheet 계열
#### 왜 중요한가
웹 기반 Excel-like spreadsheet 경험에 가깝습니다.

#### HARP에 의미
- KPI 작성/보정
- 표 생성/수정/요약 UX
- 교육/채용/현황 보고에서 수치 편집면 제공 가능

#### 한계
- 문서/슬라이드까지 함께 가려면 별도 조합 필요
- 단독으로는 HARP 전체 에디터가 되기 어려움

#### 판단
> 표 중심 AI 협업에는 좋지만, HARP 전체 플랫폼 해법은 아님.

---

## 5. 프레젠테이션(PowerPoint-like) 레퍼런스

이 영역은 오픈소스가 상대적으로 약합니다.
완전한 PowerPoint급 웹 슬라이드 편집기 + AI 공동작업 UX는 찾기 어렵습니다.

### 현실적인 전략
#### 전략 A — skeleton export 우선
- slide title
- 핵심 메시지
- 섹션 구조
- 차트 placeholder
를 HARP가 생성하고,
실제 다듬기는 외부 편집기에서 수행

#### 전략 B — outline-first editor
완성 슬라이드보다,
- slide spec
- slide hierarchy
- narrative flow
를 HARP에서 관리

#### 판단
> 슬라이드 쪽은 초기에 편집기 통합보다 **PPT skeleton export**가 훨씬 현실적입니다.

---

## 6. 상용 서비스 레퍼런스 (UX 참고용)

오픈소스보다 상용 서비스에서 더 직접적인 UX 힌트를 얻을 수 있습니다.

### A. Notion AI
- page-native AI
- 문서 안에서 AI가 같이 작성
- HARP의 문서 중심 AI UX 참고에 매우 좋음

### B. Coda AI
- 문서 + 표 + 자동화 + AI 결합
- HARP의 structured reporting과 매우 잘 맞음

### C. Microsoft 365 Copilot
- Word/Excel/PowerPoint 안에서 AI가 같이 작성하는 가장 정석적인 사례
- 사용자 기대치의 상한선을 보여줌

### D. Canva Docs / Presentations
- 문서→슬라이드 전환 UX 참고 가능

### E. Tome / Gamma
- AI가 문서/슬라이드형 산출물을 빠르게 생성하는 흐름 참고 가능

#### 판단
> 오픈소스는 편집 엔진 참고용,
> 상용 서비스는 AI 협업 UX 참고용으로 보는 게 맞습니다.

---

## 7. HARP에 가장 맞는 조합

단일 제품보다 조합 전략이 맞습니다.

### 권장 조합
#### 문서 UX
- Notion/Coda/Microsoft Copilot 패턴 참고
- 필요 시 office-like editor embedding 검토

#### 스프레드시트
- Univer / Luckysheet 계열 참고

#### 슬라이드
- 완전 편집보다 outline/skeleton export 우선

#### 파일 포맷 처리
- docx/xlsx/pptx export/import capability
- document ops layer와 결합

#### AI 협업 UX
- 좌측 AI / 중앙 편집기 / 우측 evidence panel

---

## 8. HARP 기준 우선순위

### 지금 바로 현실적인 것
1. docx export
2. xlsx summary generation
3. pptx skeleton export
4. section-level inline editing
5. evidence panel

### 중기
6. office-like document editor embedding
7. spreadsheet-like KPI editor
8. review/approval-friendly editing surface

### 장기
9. slide editor integration
10. full multi-surface office-like workspace

---

## 9. 최종 결론

질문:
> HARP에서 쓸 스프레드시트, 파워포인트, 워드 작업을 할 수 있는 오픈소스가 있는가?

답:
**있습니다. 다만 하나로 다 해결되진 않고, 조합해야 합니다.**

### 핵심 후보
- ONLYOFFICE / Collabora → 오피스 편집 엔진
- Univer / Luckysheet → spreadsheet-like 엔진
- AppFlowy / AFFiNE → 문서 워크스페이스 UX
- Notion AI / Coda AI / Microsoft Copilot → 상용 UX 레퍼런스

### 한 줄 요약
> **오픈소스는 편집 엔진 참고용, 상용 서비스는 AI 공동작성 UX 참고용으로 쓰는 게 맞습니다.**
