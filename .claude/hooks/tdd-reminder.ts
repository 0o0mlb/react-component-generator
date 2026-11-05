// PreToolUse 훅: 파일 생성/수정 직전에 tdd.md 리마인더를 컨텍스트로 주입한다 (차단하지 않음).
import { getTddReminder } from './tdd-reminder-lib.ts';

const input = JSON.parse(await Bun.stdin.text());
const filePath: string = input?.tool_input?.file_path ?? '';

const reminder = filePath ? getTddReminder(filePath) : null;
if (!reminder) process.exit(0);

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: reminder,
    },
  }),
);
