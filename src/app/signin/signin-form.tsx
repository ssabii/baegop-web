"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Provider } from "@supabase/supabase-js";
import SignInButton from "@/app/signin/signin-button";
import { SignInBubble } from "@/app/signin/signin-bubble";

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
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (errorProp) {
      const message = getAuthErrorMessage(errorCode, errorDescription);
      setTimeout(() => {
        toast.error(message, { position: "top-center" });
      }, 0);
    }
  }, [errorProp, errorCode, errorDescription]);

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
          className="w-[130px] h-[38px]"
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
      <div className="flex flex-col gap-2.5 mb-6 w-full">
        <SignInBubble className="self-center" />
        <SignInButton
          provider="kakao"
          type="button"
          onClick={() => handleOAuthLogin("kakao")}
          disabled={isLoading}
        />
        <SignInButton
          provider="google"
          type="button"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
        />
        <SignInButton
          provider="naver"
          type="button"
          onClick={() => handleOAuthLogin("custom:naver")}
          disabled={isLoading}
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
        className="text-sm text-center text-gray-400 dark:text-white underline"
      >
        로그인하지 않고 둘러보기
      </Link>
    </div>
  );
}
