"use client";

import { type Provider } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect } from "react";

import { toast } from "sonner";
import { SignInBubble } from "@/app/signin/signin-bubble";
import SignInButton from "@/app/signin/signin-button";
import { createClient } from "@/lib/supabase/client";

function getAuthErrorMessage(errorCode?: string, errorDescription?: string) {
  if (
    errorCode?.includes("email") ||
    errorDescription?.toLowerCase().includes("email")
  ) {
    return "이메일 제공에 동의해주세요. 소셜 로그인에는 이메일이 필요합니다.";
  }

  return "로그인에 실패했습니다. 다시 시도해주세요.";
}

export function SignInForm({
  redirectTo,
  error: errorProp,
  errorCode,
  errorDescription,
}: {
  redirectTo?: string;
  error?: string;
  errorCode?: string;
  errorDescription?: string;
}) {
  useEffect(() => {
    if (errorProp) {
      const message = getAuthErrorMessage(errorCode, errorDescription);
      setTimeout(() => {
        toast.error(message, { position: "top-center" });
      }, 0);
    }
  }, [errorProp, errorCode, errorDescription]);

  const handleOAuthLogin = async (provider: Provider | "custom:naver") => {
    const supabase = createClient();

    const callbackParams = new URLSearchParams({
      redirect: redirectTo || "/",
    });

    await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?${callbackParams}`,
      },
    });
  };

  return (
    <div className="flex flex-col items-center">
      <Link href="/" className="mb-8">
        <img
          src="/baegop-symbol.svg"
          alt="배곱"
          className="h-[38px] w-[130px]"
        />
      </Link>
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
                disabled={false}
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
                disabled={false}
                autoComplete="current-password"
                aria-invalid={!!passwordError}
              />
              {passwordError && (
                <FieldDescription>{passwordError}</FieldDescription>
              )}
            </Field>
            <Field>
              <Button type="submit" size="xl" className="w-full" disabled={false}>
                {isLoading ? <Spinner /> : "로그인"}
              </Button>
            </Field>
            <FieldSeparator>또는</FieldSeparator> */}
      <div className="mb-6 flex w-full flex-col gap-2.5">
        <SignInBubble className="self-center" />
        <SignInButton
          provider="kakao"
          type="button"
          onClick={() => handleOAuthLogin("kakao")}
          disabled={false}
        />
        <SignInButton
          provider="google"
          type="button"
          onClick={() => handleOAuthLogin("google")}
          disabled={false}
        />
        <SignInButton
          provider="naver"
          type="button"
          onClick={() => handleOAuthLogin("custom:naver")}
          disabled={false}
        />
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
      </div>
      <Link
        href="/"
        className="text-center text-sm text-[#4B5563] underline dark:text-[#D1D5DB]"
      >
        로그인하지 않고 둘러보기
      </Link>
    </div>
  );
}
