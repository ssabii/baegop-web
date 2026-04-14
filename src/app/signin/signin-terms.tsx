import Link from "next/link";

export function SignInTerms() {
  return (
    <footer
      role="contentinfo"
      aria-label="약관 안내"
      className="absolute bottom-12 text-center text-sm text-[#4B5563]"
    >
      <div className="flex flex-col gap-1 text-[#6B7280] dark:text-[#9CA3AF]">
        <div>로그인 시 아래 내용에 동의하는 것으로 간주합니다.</div>
        <div className="flex justify-center gap-2">
          <Link href="/terms" className="underline underline-offset-4">
            이용약관
          </Link>
          <span>|</span>
          <Link
            href="/privacy"
            className="font-bold underline underline-offset-4"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
