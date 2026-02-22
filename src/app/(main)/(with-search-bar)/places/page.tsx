import { Suspense } from "react";
import { AllPlaceList } from "@/components/places";

export default function PlacesPage() {
  return (
    <main className="flex min-h-[calc(100dvh-8.125rem)] flex-col px-4 pt-21 pb-32">
      <Suspense>
        <AllPlaceList />
      </Suspense>
    </main>
  );
}
