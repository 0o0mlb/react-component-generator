// tdd.md "TDD 불필요" 대상: 문서, 설정, 스타일
const SKIP = /(\.(md|json|css|html)$|\.config\.[cm]?[jt]s$)/;
const TEST_FILE = /\.test\.[jt]sx?$/;

const PRODUCTION_REMINDER = [
  '[TDD 리마인더] .claude/rules/tdd.md는 Rigid 규칙이다. 이 파일은 TDD 대상이다.',
  '- RED: 실패하는 테스트를 먼저 작성하고 실행해서 "기능 미구현"으로 실패하는지 확인했는가?',
  '- GREEN: 테스트를 통과시키는 최소 코드만 쓴다 (YAGNI).',
  '- 테스트보다 프로덕션 코드를 먼저 썼다면 그 코드를 삭제하고 RED부터 다시 시작한다. 참고용 보관도 금지.',
  '- 버그 수정이면 버그를 재현하는 실패 테스트가 먼저다.',
].join('\n');

const TEST_REMINDER = [
  '[TDD 리마인더] 테스트 파일을 작성/수정 중이다 (tdd.md RED 단계).',
  '- 하나의 동작 = 하나의 테스트. 이름은 기대 동작을 서술한다.',
  '- 작성 후 반드시 실행해서 실패를 확인한다. 실패 이유는 "기능 미구현"이어야 한다 (오타/import 오류는 RED가 아니다).',
  '- 처음부터 통과하는 테스트는 아무것도 증명하지 못한다.',
].join('\n');

export function getTddReminder(filePath: string): string | null {
  const path = filePath.replaceAll('\\', '/');
  if (SKIP.test(path)) return null;
  return TEST_FILE.test(path) ? TEST_REMINDER : PRODUCTION_REMINDER;
}
