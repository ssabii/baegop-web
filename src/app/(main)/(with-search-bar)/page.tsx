import { Suspense } from "react";
import { DubaiCookieBanner } from "@/components/home/dubai-cookie-banner";
import { HomeTabs } from "@/components/home/home-tabs";
import { PlaceList } from "@/components/home/place-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 px-4 pt-19 pb-40">
      <DubaiCookieBanner />
      <Suspense>
        <HomeTabs />
        <PlaceList />
      </Suspense>
    </main>
  );
}
