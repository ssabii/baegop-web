"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { toast } from "sonner";

export function SignInForm({
  redirectTo,
  error: errorProp,
}: {
  redirectTo?: string;
  error?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (errorProp) {
      setTimeout(() => {
        toast.error("로그인에 실패했습니다. 다시 시도해주세요.", {
          position: "top-center",
        });
      }, 0);
    }
  }, [errorProp]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

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

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      if (error.message === "Email not confirmed") {
        setEmailError(
          "이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.",
        );
      } else {
        setPasswordError("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
      return;
    }

    router.push(redirectTo || "/");
    router.refresh();
  };

  const handleKakaoLogin = async () => {
    const supabase = createClient();

    const callbackParams = new URLSearchParams({
      redirect: redirectTo || "/",
    });

    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?${callbackParams}`,
      },
    });
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();

    const callbackParams = new URLSearchParams({
      redirect: redirectTo || "/",
    });

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?${callbackParams}`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-sm">
        <div>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <Link href="/" className="flex items-center gap-1">
                <img src="/baegop.svg" alt="배곱" className="size-6" />
                <h1 className="text-2xl font-bold">배곱</h1>
              </Link>
              <FieldDescription>
                소셜 로그인으로 배곱을 시작해보세요
              </FieldDescription>
            </div>
            {/* <Field data-invalid={emailError ? true : undefined}>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                size="lg"
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
            <Field data-invalid={passwordError ? true : undefined}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">비밀번호</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm underline-offset-4 hover:underline"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                size="lg"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                disabled={isLoading}
                autoComplete="current-password"
                aria-invalid={!!passwordError}
              />
              {passwordError && (
                <FieldDescription>{passwordError}</FieldDescription>
              )}
            </Field>
            <Field>
              <Button type="submit" size="xl" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : "로그인"}
              </Button>
            </Field>
            <FieldSeparator>또는</FieldSeparator> */}
            <Field className="gap-4 max-w-xs mx-auto">
              <Button
                type="button"
                size="xl"
                className="w-full bg-[#FFEB00] text-black/85 hover:bg-[#FFEB00]/90"
                onClick={handleKakaoLogin}
                disabled={isLoading}
              >
                <Image
                  src="/icons/kakao.svg"
                  alt="Kakao"
                  width={20}
                  height={20}
                />
                카카오로 시작하기
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xl"
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
              {/* <FieldDescription className="text-center">
                계정이 없으신가요?{" "}
                <Link
                  href={
                    redirectTo
                      ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
                      : "/signup"
                  }
                >
                  회원가입
                </Link>
              </FieldDescription> */}
            </Field>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
