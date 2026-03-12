import { Suspense } from "react";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AllPlaceList } from "@/components/places";
import { fetchPlaces } from "@/lib/queries/places";

const STALE_TIME = 5 * 60 * 1000;

export default async function PlacesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME },
    },
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["places", "all"],
    queryFn: () =>
      fetchPlaces({
        orderBy: "rating",
        ascending: false,
      }),
    initialPageParam: 0,
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 pt-21 pb-40">
      <Suspense>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <AllPlaceList />
        </HydrationBoundary>
      </Suspense>
    </main>
  );
}
