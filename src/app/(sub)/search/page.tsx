import { Suspense } from "react";
import { PlaceSearch } from "@/components/place-search";

export default function SearchPage() {
  return (
    <Suspense>
      <PlaceSearch />
    </Suspense>
  );
}
