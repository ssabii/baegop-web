import { Suspense } from "react";
import { AllPlaceList } from "@/components/places";

export default function PlacesPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 pt-21 pb-40">
      <Suspense>
        <AllPlaceList />
      </Suspense>
    </main>
  );
}
