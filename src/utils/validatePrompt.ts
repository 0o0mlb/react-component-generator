// 프롬프트 입력 검증용 순수 함수.

export const PROMPT_MAX_LENGTH = 500;

export interface PromptValidation {
  valid: boolean;
  length: number;
  error?: string;
}

/** 제출 시 trim된 값이 전송되므로 trim 기준 길이로 검증한다. */
export function validatePromptLength(prompt: string): PromptValidation {
  const length = prompt.trim().length;
  if (length > PROMPT_MAX_LENGTH) {
    return {
      valid: false,
      length,
      error: `프롬프트는 ${PROMPT_MAX_LENGTH}자를 넘을 수 없습니다.`,
    };
  }
  return { valid: true, length };
}
