"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { validatePassword } from "@/lib/password";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsLoading(false);
      const message =
        error.code === "same_password"
          ? "현재 비밀번호와 다른 비밀번호를 입력해주세요."
          : error.code === "weak_password"
            ? "보안에 취약한 비밀번호입니다. 다른 비밀번호를 입력해주세요."
            : "비밀번호 변경에 실패했습니다. 다시 시도해주세요.";
      setPasswordError(message);
      return;
    }

    toast.success("비밀번호가 변경되었습니다.");
    router.push("/signin");
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link href="/" className="flex items-center gap-1">
              <img src="/baegop.svg" alt="배곱" className="size-6" />
              <h1 className="text-2xl font-bold">배곱</h1>
            </Link>
            <FieldDescription>새로운 비밀번호를 설정해주세요</FieldDescription>
          </div>
          <Field
            data-invalid={passwordError ? true : undefined}
            className="gap-2"
          >
            <FieldLabel htmlFor="password">새 비밀번호</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={`${PASSWORD_MIN_LENGTH}자 이상 입력하세요`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                disabled={isLoading}
                autoComplete="new-password"
                aria-invalid={!!passwordError}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <FieldDescription>{passwordError}</FieldDescription>
            )}
          </Field>
          <Field
            data-invalid={confirmPasswordError ? true : undefined}
            className="gap-2"
          >
            <FieldLabel htmlFor="confirm-password">비밀번호 확인</FieldLabel>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                disabled={isLoading}
                autoComplete="new-password"
                aria-invalid={!!confirmPasswordError}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <FieldDescription>{confirmPasswordError}</FieldDescription>
            )}
          </Field>
          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner /> : "비밀번호 변경"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
