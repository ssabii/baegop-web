"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?${new URLSearchParams({ redirect: "/reset-password" })}`,
    });

    setIsLoading(false);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <Empty className="border-none">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <Mail className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">이메일을 확인해주세요</EmptyTitle>
          <EmptyDescription>
            비밀번호 재설정 링크를 발송했어요
            <br />
            메일이 보이지 않으면 스팸함을 확인해주세요
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button asChild variant="outline">
            <Link href="/signin">로그인 페이지로 이동</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link href="/" className="flex items-center gap-1">
              <img src="/baegop.svg" alt="배곱" className="size-6" />
              <h1 className="text-2xl font-bold">배곱</h1>
            </Link>
            <FieldDescription>
              가입한 이메일을 입력하면
              <br />
              비밀번호 재설정 링크를 보내드려요
            </FieldDescription>
          </div>
          <Field data-invalid={emailError ? true : undefined}>
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
          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner /> : "재설정 링크 보내기"}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            <Link href="/signin">로그인 페이지로 돌아가기</Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
