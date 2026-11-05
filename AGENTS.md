# AGENTS.md

## Operational Commands

- 패키지 매니저는 bun 고정. npm/yarn/pnpm 사용 금지 (`bun.lock` 사용, 서버는 `Bun.serve` 의존).
- `bun install` : 의존성 설치
- `bun run dev` : API 서버(3002) + Vite(5173) 동시 실행
- `bun run server` : API 서버만 실행 (`bun --watch`)
- `bun run test` : vitest 전체 실행 (src/** 및 server/** 테스트). `bun test`(Bun 내장 러너)는 jsdom 설정을 읽지 않으므로 사용 금지
- `bun run lint` : ESLint
- `bun run build` : `tsc -b && vite build`. 작업 완료 전 lint, test, build 통과 확인

## Golden Rules

Immutable:
- API 키를 코드, 로그, 커밋에 넣지 않는다. `.env`는 gitignore 대상이다 (.gitignore).
- 서버 환경변수 키 값을 클라이언트로 내려보내지 않는다. `/api/config`는 `!!` 불리언만 반환한다 (server/index.ts:150-153). 이 경계를 유지한다.
- 생성된 코드는 react-live `noInline`으로 실행된다 (src/components/LivePreview.tsx:14). 이 모드는 `render(<X />)` 호출이 있어야 그려지므로 해당 계약을 깨지 않는다.

Do:
- 타입 전용 import는 `import type`을 쓴다 (`verbatimModuleSyntax`, tsconfig.app.json).
- enum, 파라미터 프로퍼티 등 비-erasable 문법을 쓰지 않는다 (`erasableSyntaxOnly`, tsconfig.app.json).
- 서버 로직 변경 시 순수 함수는 `server/generator.ts`, `server/fallback.ts`에 두고 테스트를 함께 추가한다.
- 새 프로바이더/모델을 추가할 때 두 프로바이더의 에러 처리 경로가 대칭인지 확인한다 (아래 비대칭 참고).

Don't:
- 포트 3002를 한쪽만 바꾸지 않는다. `server/index.ts:139`와 `vite.config.ts:11`에 중복 정의되어 있다.
- 서버 에러 메시지에서 상태 코드 문자열(`503`, `429`)을 제거하지 않는다. `message.includes('503')`로 HTTP 상태를 매핑한다 (server/index.ts:194, 201). `Claude API error: ${status}` 형식이 이 매핑의 입력이다 (server/index.ts:85).
- 시스템 프롬프트의 "import 금지 / TypeScript 문법 금지 / render() 호출" 규칙을 완화하지 않는다 (server/index.ts:11, 12, 20). react-live는 import와 타입 어노테이션을 처리하지 못한다.

Team-specific (코드 근거):
- 비대칭: 모델 폴백은 Google만 적용된다 (server/index.ts:135 `withModelFallback`). Anthropic은 단일 모델 고정이며 폴백이 없다 (server/index.ts:77). Anthropic에 폴백이 필요하면 대칭 구현을 추가하고, 의도된 차이라면 유지한다.
- 테스트 경계: 테스트 있음 = `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`. 테스트 없음 = `server/index.ts`(HTTP 핸들러, 프로바이더 호출), `src/hooks/useComponentGenerator.ts`, `LivePreview.tsx`. 미테스트 영역 수정 시 수동 검증(`bun run dev`)을 수행하거나 테스트를 추가한다.
- 이중 방어: 코드펜스 제거와 render 호출은 프롬프트 지시(server/index.ts:12, 16)와 후처리(`stripCodeFences`, `ensureRenderCall`, server/index.ts:188) 양쪽에서 보장한다. 한쪽을 제거하면 모델이 규칙을 어길 때 미리보기가 깨진다.
- 보안 경계: Google 호출은 API 키를 URL 쿼리로 전달한다 (server/index.ts:99). 해당 URL이나 fetch 에러 객체를 로그/응답에 출력하지 않는다. 클라이언트 입력 키는 요청 바디로만 서버에 전달된다 (src/hooks/useComponentGenerator.ts:26).

## Project Context

프롬프트로 React 컴포넌트를 생성하고 실시간 미리보기를 제공하는 도구.
Stack: React 19, TypeScript, Vite, Bun(API 프록시), react-live, vitest, Anthropic/Gemini API.
설치/실행/기능 설명은 README.md 참고.

## Standards & References

- 커밋: `<type>: <한국어 요약>` (type: feat, fix, refactor, chore). 요약은 50자 내외, 마침표 없음. 절차는 `.claude/skills/commit/SKILL.md`.
- 요청 없이 `git push`, `--amend`, `--force`, `--no-verify`를 쓰지 않는다.
- 코드 주석과 UI 문구는 한국어로 쓴다 (기존 파일 관례).
- Maintenance Policy: 이 문서의 규칙과 코드가 어긋나면 작업 중 즉시 업데이트를 제안한다.

## Context Map

- **[API 서버 수정 (Bun)](./server/AGENTS.md)** — 프로바이더 호출, 폴백, 응답 정규화, 에러 매핑 작업 시.
- **[프론트엔드 수정 (React)](./src/AGENTS.md)** — 컴포넌트, 훅, 미리보기, 프론트 테스트 작업 시.
