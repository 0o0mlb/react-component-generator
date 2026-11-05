---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 템플릿에 맞는 Pull Request를 GitHub에 생성한다. "PR 만들어줘", "PR 생성", "풀리퀘 올려줘", "create PR", "open a pull request" 요청 시 활성화한다.
context: fork
agent: general-purpose
allowed-tools: Bash(git *), Bash(gh *), Read, Grep, Glob
---

# Create PR 스킬

`context: fork`로 별도 서브 에이전트 컨텍스트에서 실행된다. 메인 대화 기록을 볼 수 없으므로, 필요한 정보는 모두 git 상태와 인자(`$ARGUMENTS`)에서 얻는다. 인자에는 베이스 브랜치, 제목 힌트, 이슈 번호 등이 올 수 있다.

## 언어 규칙

PR 제목·본문의 언어는 대상 저장소로 결정한다.

| 조건 | 언어 | 템플릿 |
|------|------|--------|
| 현재 프로젝트(`react-component-generator`) | 한국어 | `references/pr-template.ko.md` |
| 그 외 모든 저장소 | 영어 | `references/pr-template.en.md` |

판별 방법:

```bash
gh repo view --json name -q .name   # 실패 시: git remote get-url origin
```

저장소 이름이 `react-component-generator`이면 한국어, 아니면 영어. 판별할 수 없으면 영어를 쓴다. 사용자가 인자로 언어를 명시하면 그것이 우선한다.

## 절차

### 1. 상태 확인
```bash
git status --short
git branch --show-current
gh repo view --json defaultBranchRef -q .defaultBranchRef.name   # 베이스 브랜치
```
- 현재 브랜치가 베이스 브랜치(main 등)와 같으면 중단하고 보고한다. 브랜치를 임의로 만들지 않는다.
- 커밋되지 않은 변경이 있으면 PR에 포함되지 않음을 보고한다. 대신 커밋하지 않는다.

### 2. 변경 분석
```bash
git fetch origin
git log --oneline origin/<base>..HEAD
git diff origin/<base>...HEAD --stat
git diff origin/<base>...HEAD
```
- 커밋 로그와 diff를 읽고 "무엇을, 왜" 바꿨는지 파악한다.
- 비밀 정보(`.env`, 키, 토큰)가 diff에 있으면 PR을 만들지 않고 보고한다.

### 3. 템플릿 작성
- 언어 규칙에 따라 템플릿을 `Read`하고 모든 섹션을 채운다. 해당 없는 섹션은 "해당 없음"/"N/A"로 남긴다.
- 변경하지 않은 검증을 한 것처럼 체크하지 않는다. 실제로 실행한 항목만 체크한다.
- 제목: 한국어는 `<type>: <한국어 요약>`(type: feat, fix, refactor, chore, 50자 내외, 마침표 없음), 영어는 `<type>: <summary>`(imperative, 72자 이내).
- 본문 마지막 줄에 `🤖 Generated with [Claude Code](https://claude.com/claude-code)`를 붙인다.

### 4. 푸시 및 PR 생성
```bash
git push -u origin HEAD        # 원격에 브랜치가 없거나 뒤처진 경우만
gh pr create --base <base> --title "<제목>" --body-file <임시 본문 파일>
```
- 본문은 스크래치 디렉터리(프로젝트 밖)의 임시 파일에 쓰고 `--body-file`로 전달한다.
- 이미 같은 브랜치의 열린 PR이 있으면(`gh pr view`) 새로 만들지 않고 URL을 보고한다.
- 사용자가 요청하지 않는 한 draft가 아닌 일반 PR로 만든다. `--draft`가 인자로 오면 따른다.

### 5. 보고
서브 에이전트의 최종 응답에 다음만 담는다: PR URL, 제목, 사용한 언어/템플릿, 베이스 ← 헤드 브랜치, 특이사항(미커밋 변경, 미실행 검증 등).

## 금지 사항
- `--force`, `--no-verify`, `--amend` 사용 금지
- 베이스 브랜치에 직접 푸시 금지
- 비밀 정보 포함 diff로 PR 생성 금지
- 실행하지 않은 테스트·빌드를 통과했다고 쓰지 않는다
