import Link from "next/link";
import { Suspense } from "react";
import { HomeTabs } from "@/components/home/home-tabs";
import { PlaceList } from "@/components/home/place-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 pt-21 pb-40 px-4">
      <Suspense>
        <HomeTabs />
        <PlaceList />
      </Suspense>
      <footer className="mt-auto flex justify-center gap-3 text-sm text-muted-foreground">
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
      </footer>
    </main>
  );
}
