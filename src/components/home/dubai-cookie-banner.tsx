import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function DubaiCookieBanner() {
  return (
    <Link
      href="/map/dubaicookie"
      className="flex items-center justify-between rounded-xl bg-linear-to-r to-[#B8D050] from-[#6B9B2E] px-4 py-3 text-white transition-opacity active:opacity-80 dark:to-[#9BB83A] dark:from-[#5A7B26]"
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
          <p className="text-sm font-medium text-white">
            유행이 끝나기 전에 준비해봤어요
          </p>
          <p className="font-bold text-white">두쫀쿠 지도</p>
        </div>
      </div>
      <ChevronRight className="size-6 text-white" />
    </Link>
  );
}
