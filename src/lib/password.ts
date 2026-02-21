import { PASSWORD_MIN_LENGTH, PASSWORD_REQUIRES_MIX } from "@/lib/constants";

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  }
  if (PASSWORD_REQUIRES_MIX && !/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return "영문과 숫자를 모두 포함해야 합니다.";
  }
  return null;
}
