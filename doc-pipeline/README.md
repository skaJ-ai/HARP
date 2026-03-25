# Document Pipeline: MD → PDF

영상 [12:02]에서 설명된 방식을 구현합니다:
**마크다운으로 원본 관리 → 템플릿 기반 PDF 빌드 → 고객사 산출물 공유**

## Prerequisites

### Typst (필수)
현대적인 조판 시스템. LaTeX보다 빠르고 문법이 간결합니다.

```bash
# macOS
brew install typst

# Windows
winget install --id Typst.Typst

# Cargo
cargo install typst-cli
```

### Pandoc (권장)
Markdown → Typst 변환에 사용합니다.

```bash
# macOS
brew install pandoc

# Windows
winget install --id JohnMacFarlane.Pandoc
```

## Usage

```bash
# 모든 docs/ 하위 MD 파일을 PDF로 변환
./doc-pipeline/build.sh

# 특정 디렉토리만
./doc-pipeline/build.sh docs/03-cps-prd/

# 특정 파일만
./doc-pipeline/build.sh docs/03-cps-prd/CPS-TEMPLATE.md
```

## Output

빌드된 PDF는 `doc-pipeline/output/` 에 생성됩니다.
파일명 형식: `{directory}--{filename}.pdf`

## Template Customization

`templates/default.typ` 을 수정하여 조직에 맞는 문서 스타일을 적용할 수 있습니다:
- 로고
- 폰트 (기본: Pretendard)
- 색상 테마
- 머리글/바닥글
