import { describe, it, expect } from 'vitest';
import { isGitCommit } from './commit-guard-lib';

describe('isGitCommit', () => {
  it('git commit -m 명령을 커밋으로 판별한다', () => {
    expect(isGitCommit('git commit -m "feat: 추가"')).toBe(true);
  });

  it('인자 없는 git commit도 커밋으로 판별한다', () => {
    expect(isGitCommit('git commit')).toBe(true);
  });

  it('git -C <경로> commit처럼 전역 옵션이 앞서도 커밋으로 판별한다', () => {
    expect(isGitCommit('git -C ../other commit -m x')).toBe(true);
  });

  it('&&로 이어진 명령 뒤쪽의 git commit도 판별한다', () => {
    expect(isGitCommit('git add . && git commit -m x')).toBe(true);
  });

  it('세미콜론이나 파이프 뒤의 git commit도 판별한다', () => {
    expect(isGitCommit('echo hi; git commit -m x')).toBe(true);
  });

  it('git commit-tree 같은 다른 서브커맨드는 커밋으로 보지 않는다', () => {
    expect(isGitCommit('git commit-tree HEAD^{tree}')).toBe(false);
  });

  it('git status는 커밋이 아니다', () => {
    expect(isGitCommit('git status')).toBe(false);
  });

  it('인자에 commit 단어가 들어간 git log는 커밋이 아니다', () => {
    expect(isGitCommit('git log --grep commit')).toBe(false);
  });

  it('git이 아닌 명령은 커밋이 아니다', () => {
    expect(isGitCommit('bun run test')).toBe(false);
  });
});
