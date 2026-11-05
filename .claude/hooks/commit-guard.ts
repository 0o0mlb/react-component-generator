// PreToolUse 훅: git commit 직전에 전체 테스트를 실행하고, 하나라도 실패하면 차단한다 (exit 2).
import { isGitCommit } from './commit-guard-lib.ts';

const MAX_OUTPUT = 4000;

const input = JSON.parse(await Bun.stdin.text());
const command: string = input?.tool_input?.command ?? '';

if (!isGitCommit(command)) process.exit(0);

const cwd = input?.cwd ?? process.cwd();
const proc = Bun.spawn(['bun', 'run', 'test'], {
  cwd,
  stdout: 'pipe',
  stderr: 'pipe',
});

const [stdout, stderr, code] = await Promise.all([
  new Response(proc.stdout).text(),
  new Response(proc.stderr).text(),
  proc.exited,
]);

if (code === 0) process.exit(0);

const output = (stdout + stderr).trim();
const tail = output.length > MAX_OUTPUT ? '...\n' + output.slice(-MAX_OUTPUT) : output;
console.error(
  `커밋 차단: bun run test가 실패했습니다 (exit ${code}). 테스트를 고친 뒤 다시 커밋하세요.\n\n${tail}`,
);
process.exit(2);
