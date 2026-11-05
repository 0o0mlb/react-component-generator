# server/AGENTS.md

## Module Context

Bun 런타임의 AI API 프록시. `index.ts`가 HTTP 라우팅과 프로바이더 호출을 담당하고, 순수 로직은 `generator.ts`, `fallback.ts`로 분리되어 있다. Vite가 `/api`를 3002 포트로 프록시한다.

## Tech Stack & Constraints

- `Bun.serve`, `process.env`, 전역 `fetch` 사용. 외부 HTTP 클라이언트/SDK 의존성을 추가하지 않는다 (현재 두 프로바이더 모두 직접 fetch).
- `index.ts`는 import 시 서버가 기동되는 부수효과가 있다 (server/index.ts:138). 테스트에서 import하지 않는다. 테스트 대상 로직은 부수효과 없는 모듈로 분리한다.

## Implementation Patterns

- 새 프로바이더: `callX(prompt, apiKey)` 함수 추가, `Provider` 타입과 `ENV_KEYS` 확장 (server/index.ts:57-62), `/api/generate` 분기 확장 (server/index.ts:183-186).
- 모든 응답에 `CORS_HEADERS`를 붙인다. 성공/에러/404 응답 모두 동일하게 적용된다.
- 모델 폴백은 `withModelFallback(models, attempt)`로 감싼다. 모두 실패하면 마지막 에러를 던진다 (server/fallback.ts:19).
- 프로바이더 응답 파싱 후 반드시 `ensureRenderCall(stripCodeFences(text))`를 통과시킨다 (server/index.ts:188).

## Testing Strategy

- `bun run test`로 실행. 테스트 파일은 대상 옆에 `*.test.ts`로 둔다 (server/generator.test.ts 참고).
- 테스트는 한국어 `it` 설명, 순수 함수 단위로 작성한다.

## Local Golden Rules

- 비대칭: Gemini는 `finishReason === 'MAX_TOKENS'`를 에러로 처리하지만 (server/index.ts:123) Anthropic 경로에는 `stop_reason` 검사가 없다. 잘린 응답이 그대로 반환될 수 있으므로 Anthropic 수정 시 고려한다.
- 에러 매핑은 메시지 문자열 매칭이다 (server/index.ts:194, 201). 새 프로바이더 에러도 `... error: ${status}` 형식을 따른다.
- 폴백 대상 에러를 구분하지 않는다. `withModelFallback`은 모든 예외에서 다음 모델로 넘어간다 (server/fallback.ts:15). 인증 오류(401/403)도 재시도되므로 모델 수만큼 호출이 낭비된다.
- 클라이언트 키가 env 키보다 우선한다 (`clientKey || ENV_KEYS[provider]`, server/index.ts:65). 순서를 바꾸지 않는다.
