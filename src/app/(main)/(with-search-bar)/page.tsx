import { Suspense } from "react";
import { HomeTabs } from "@/components/home/home-tabs";
import { PlaceList } from "@/components/home/place-list";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100dvh-8.125rem)] flex-col gap-4 px-4 pt-21 pb-32">
      <Suspense>
        <HomeTabs />
        <PlaceList />
      </Suspense>
    </main>
  );
}
