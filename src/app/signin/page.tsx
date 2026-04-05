import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "./signin-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <div className="flex h-dvh flex-col items-center justify-center px-5 py-12 bg-background">
      <div className="w-full max-w-sm">
        <SignInForm
          redirectTo={params.redirect}
          error={params.error}
          errorCode={params.error_code}
          errorDescription={params.error_description}
        />
      </div>
      <p className="absolute bottom-12 text-sm text-muted-foreground text-center">
        {`로그인 시 `}
        <Link href="/terms" className="underline underline-offset-4">
          이용약관
        </Link>
        {` 및 `}
        <Link
          href="/privacy"
          className="font-bold text-accent-foreground underline underline-offset-4"
        >
          개인정보처리방침
        </Link>
        에<br /> 동의한 것으로 간주합니다.
      </p>
    </div>
  );
}
