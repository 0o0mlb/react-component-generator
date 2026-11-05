// 명령 시작 또는 ; & | 뒤의 `git [전역옵션...] commit`을 찾는다
const GIT_COMMIT = /(?:^|[;&|]\s*)git(?:\s+-\S+(?:\s+[^\s-]\S*)?)*\s+commit(?=\s|$)/;

export function isGitCommit(command: string): boolean {
  return GIT_COMMIT.test(command);
}
