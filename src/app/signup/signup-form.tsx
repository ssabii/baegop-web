"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { validatePassword } from "@/lib/password";
import { generateRandomNickname } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function SignUpForm({
  error: errorProp,
}: React.ComponentProps<"div"> & {
  error?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    if (errorProp) {
      toast.error("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  }, [errorProp]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { nickname: generateRandomNickname() },
      },
    });

    if (error) {
      setIsLoading(false);
      if (error.message.includes("already registered")) {
        setEmailError("이미 가입된 이메일입니다.");
      } else {
        setEmailError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
      return;
    }

    router.push("/signup/confirm");
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSignUp} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1">
              <Link href="/" className="">
                <img src="/baegop.svg" alt="배곱" className="size-6" />
              </Link>
              <h1 className="text-2xl font-bold">배곱</h1>
            </div>
            <FieldDescription>
              회원가입 후 배곱을 시작해보세요.
            </FieldDescription>
          </div>
          <Field data-invalid={emailError ? true : undefined} className="gap-2">
            <FieldLabel htmlFor="email">이메일</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              disabled={isLoading}
              autoComplete="email"
              aria-invalid={!!emailError}
            />
            {emailError && <FieldDescription>{emailError}</FieldDescription>}
          </Field>
          <Field
            data-invalid={passwordError ? true : undefined}
            className="gap-2"
          >
            <FieldLabel htmlFor="password">비밀번호</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder={`${PASSWORD_MIN_LENGTH}자 이상 입력하세요`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={!!passwordError}
            />
            {passwordError && (
              <FieldDescription>{passwordError}</FieldDescription>
            )}
          </Field>
          <Field
            data-invalid={confirmPasswordError ? true : undefined}
            className="gap-2"
          >
            <FieldLabel htmlFor="confirm-password">비밀번호 확인</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={!!confirmPasswordError}
            />
            {confirmPasswordError && (
              <FieldDescription>{confirmPasswordError}</FieldDescription>
            )}
          </Field>
          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner /> : "회원가입"}
            </Button>
          </Field>
          <FieldSeparator>또는</FieldSeparator>
          <Field>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Image
                src="/icons/google.svg"
                alt="Google"
                width={20}
                height={20}
              />
              Google로 시작하기
            </Button>
            <FieldDescription className="text-center">
              이미 계정이 있으신가요? <Link href="/signin">로그인</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
