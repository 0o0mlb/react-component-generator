import { describe, it, expect } from 'vitest';
import { getTddReminder } from './tdd-reminder-lib';

describe('getTddReminder', () => {
  it('프로덕션 코드 파일에는 테스트 먼저 작성하라는 RED 리마인더를 반환한다', () => {
    const msg = getTddReminder('server/generator.ts');

    expect(msg).toContain('RED');
    expect(msg).toContain('tdd.md');
  });

  it('프로덕션 코드 리마인더는 테스트보다 먼저 쓴 코드의 삭제 규칙을 상기시킨다', () => {
    expect(getTddReminder('src/hooks/useX.ts')).toContain('삭제');
  });

  it('테스트 파일에는 실행해서 실패를 확인하라는 리마인더를 반환한다', () => {
    const msg = getTddReminder('server/generator.test.ts');

    expect(msg).toContain('실패');
    expect(msg).not.toBe(getTddReminder('server/generator.ts'));
  });

  it('윈도우 역슬래시 경로의 테스트 파일도 테스트 파일로 인식한다', () => {
    const msg = getTddReminder('C:\\proj\\src\\App.test.tsx');

    expect(msg).not.toBeNull();
    expect(msg).toBe(getTddReminder('server/generator.test.ts'));
  });

  it('마크다운 문서에는 리마인더를 주입하지 않는다', () => {
    expect(getTddReminder('AGENTS.md')).toBeNull();
  });

  it('JSON 설정 파일에는 리마인더를 주입하지 않는다', () => {
    expect(getTddReminder('package.json')).toBeNull();
  });

  it('vite.config.ts 같은 설정 파일에는 리마인더를 주입하지 않는다', () => {
    expect(getTddReminder('vite.config.ts')).toBeNull();
  });

  it('CSS 파일에는 리마인더를 주입하지 않는다', () => {
    expect(getTddReminder('src/App.css')).toBeNull();
  });
});
