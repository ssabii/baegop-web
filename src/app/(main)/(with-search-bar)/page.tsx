import Link from "next/link";
import { Suspense } from "react";
import { DubaiCookieBanner } from "@/components/home/dubai-cookie-banner";
import { HomeTabs } from "@/components/home/home-tabs";
import { PlaceList } from "@/components/home/place-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 px-4 pt-21 pb-40">
      <DubaiCookieBanner />
      <Suspense>
        <HomeTabs />
        <PlaceList />
      </Suspense>
      <footer className="mt-auto flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <img src="/baegop.svg" alt="배곱" className="size-4" />
          <span className="font-bold text-foreground">배곱</span>
        </div>
        <p className="text-center text-xs">
          주변 맛집 장소 추천 서비스
        </p>
        <div className="flex justify-center gap-3 text-xs">
          <Link href="/terms" className="underline underline-offset-4">
            이용약관
          </Link>
          <span>|</span>
          <Link
            href="/privacy"
            className="font-bold text-accent-foreground underline underline-offset-4"
          >
            개인정보처리방침
          </Link>
        </div>
      </footer>
    </main>
  );
}
