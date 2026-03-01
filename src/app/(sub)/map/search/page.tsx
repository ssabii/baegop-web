import { Suspense } from "react";
import { MapSearch } from "./map-search";

export default function MapSearchPage() {
  return (
    <Suspense>
      <MapSearch />
    </Suspense>
  );
}
