# src/AGENTS.md

## Module Context

Vite + React 19 프론트엔드. `hooks/useComponentGenerator.ts`가 `/api/generate` 호출과 결과 목록 상태를 관리하고, `components/`가 입력, 코드 표시, 미리보기를 렌더한다.

## Tech Stack & Constraints

- 미리보기는 react-live `LiveProvider noInline` (src/components/LivePreview.tsx:14). 생성 코드는 import 없이 전역 React 스코프에서 실행된다.
- 스타일은 `App.css`, `index.css`의 클래스 기반 (`preview-panel`, `panel-header` 등). 생성 컴포넌트와 달리 앱 UI는 인라인 스타일 전용이 아니다.
- 서버 호출은 상대 경로 `/api/*`만 사용한다 (Vite 프록시 의존, vite.config.ts:9-14). 절대 URL을 하드코딩하지 않는다.

## Implementation Patterns

- 서버 통신/상태는 훅에 둔다. 컴포넌트는 props로 받는다 (src/hooks/useComponentGenerator.ts 참고).
- 공용 타입은 `src/types/index.ts`에 둔다. `Provider` 타입은 서버(server/index.ts:57)에도 별도로 정의되어 있으므로 프로바이더 추가 시 양쪽을 함께 수정한다.
- 실패 시 `error` 문자열 상태로 노출한다. 서버가 `{ error }`를 반환하는 계약을 따른다 (src/hooks/useComponentGenerator.ts:30-32).

## Testing Strategy

- vitest + jsdom + Testing Library. 설정은 src/test/setup.ts (각 테스트 후 `cleanup`). `bun run test`로 실행.
- 컴포넌트 테스트는 `*.test.tsx`를 대상 옆에 둔다 (src/components/PromptInput.test.tsx 참고). 사용자 상호작용은 `@testing-library/user-event`를 쓴다.

## Local Golden Rules

- 테스트 경계: 훅과 `LivePreview`, `CodeView`, `ComponentCard`에는 테스트가 없다. 동작 변경 시 테스트 추가를 우선한다.
- API 키 상태는 컴포넌트 메모리(`useState`)에만 둔다 (src/App.tsx:14). `localStorage` 등에 저장하지 않는다 (코드베이스에 저장 코드 없음, 보안 경계 유지).
- 키 입력이 비어 있고 서버 env 키도 없으면 요청 자체를 막는다 (src/App.tsx:34). 이 검증을 서버 검증으로만 대체하지 않는다.
- `generate`에 키가 비면 `apiKey` 필드를 보내지 않는다 (`...(apiKey && { apiKey })`, src/hooks/useComponentGenerator.ts:26). 빈 문자열을 보내면 서버의 env 키 폴백(`clientKey || ENV_KEYS`)은 동작하지만 계약을 유지한다.
