import { Suspense } from "react";
import { HomeTabs } from "@/components/home/home-tabs";
import { PlaceList } from "@/components/home/place-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 px-4 pt-21 pb-40">
      <Suspense>
        <HomeTabs />
        <PlaceList />
      </Suspense>
    </main>
  );
}
