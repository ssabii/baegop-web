import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function DubaiCookieBanner() {
  return (
    <Link
      href="/map/dubai-cookie"
      className="flex items-center justify-between rounded-xl bg-linear-to-r from-[#6B9B2E] to-[#B8D050] px-4 py-3 text-white transition-opacity active:opacity-80 dark:from-[#5A7B26] dark:to-[#9BB83A]"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label="쿠키">
          <img
            src="/dubai-cookie.svg"
            alt="두바이 쫀득 쿠키"
            className="size-12"
          />
        </span>
        <div>
          <p className="text-sm font-medium text-background">
            유행의 막바지에 준비해 봤어요
          </p>
          <p className="font-bold text-background">두쫀쿠 지도</p>
        </div>
      </div>
      <ChevronRight className="size-6 text-background" />
    </Link>
  );
}
