import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="text-muted-foreground mt-auto flex flex-col items-center gap-2 text-sm">
      <img src="/baegop-symbol.svg" alt="배곱" className="w-16" />
      <p className="text-center text-xs">주변 맛집 장소 추천 서비스</p>
      <div className="flex justify-center gap-3 text-xs">
        <Link href="/terms" className="underline underline-offset-4">
          이용약관
        </Link>
        <span>|</span>
        <Link
          href="/privacy"
          className="text-accent-foreground font-bold underline underline-offset-4"
        >
          개인정보처리방침
        </Link>
      </div>
    </footer>
  );
}
