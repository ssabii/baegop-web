import { Suspense } from "react";
import { PlaceSearch } from "@/components/place-search";
import { COMPANY_LOCATION } from "@/lib/constants";
import { searchPlaces } from "@/lib/search";

const DEFAULT_DISPLAY = 10;

interface SearchPageProps {
  searchParams: Promise<{ query?: string; display?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { query, display } = await searchParams;
  const displayNum = Math.min(
    Math.max(Number(display) || DEFAULT_DISPLAY, 1),
    100,
  );

  const results = query
    ? await searchPlaces(
        query,
        displayNum,
        String(COMPANY_LOCATION.lng),
        String(COMPANY_LOCATION.lat),
      )
    : null;

  return (
    <Suspense>
      <PlaceSearch autoFocus={!query} initialResults={results} />
    </Suspense>
  );
}
