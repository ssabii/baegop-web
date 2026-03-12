import { Suspense } from "react";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AllPlaceList } from "@/components/places";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { fetchPlaces } from "@/lib/queries/places";
import { placeKeys } from "@/lib/query-keys";

export default async function PlacesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: QUERY_STALE_TIME },
    },
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: placeKeys.list("all"),
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
