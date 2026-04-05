import Link from "next/link";

export function SignInTerms() {
  return (
    <footer role="contentinfo" aria-label="약관 안내" className="absolute bottom-12 text-sm text-muted-foreground text-center">
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
    </footer>
  );
}
