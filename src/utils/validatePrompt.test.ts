import { describe, it, expect } from 'vitest';
import { PROMPT_MAX_LENGTH, validatePromptLength } from './validatePrompt';

describe('validatePromptLength', () => {
  it('최대 길이는 500자다', () => {
    expect(PROMPT_MAX_LENGTH).toBe(500);
  });

  it('500자 이하면 유효하다', () => {
    const result = validatePromptLength('a'.repeat(500));
    expect(result.valid).toBe(true);
    expect(result.length).toBe(500);
    expect(result.error).toBeUndefined();
  });

  it('501자면 유효하지 않고 에러 메시지를 반환한다', () => {
    const result = validatePromptLength('a'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.length).toBe(501);
    expect(result.error).toBe('프롬프트는 500자를 넘을 수 없습니다.');
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    const result = validatePromptLength(`  ${'a'.repeat(500)}  `);
    expect(result.valid).toBe(true);
    expect(result.length).toBe(500);
  });

  it('빈 문자열은 길이 검증을 통과한다', () => {
    expect(validatePromptLength('').valid).toBe(true);
  });
});
