import { Suspense } from "react";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DubaiCookieBanner } from "@/components/home/dubai-cookie-banner";
import { HomeTabs } from "@/components/home/home-tabs";
import { HomeFooter } from "@/components/home/home-footer";
import { PlaceList } from "@/components/home/place-list";
import { PlaceListSkeleton } from "@/components/home/place-list-skeleton";
import { fetchPlaces } from "@/lib/queries/places";
import {
  POPULAR_RATING_THRESHOLD,
  POPULAR_MIN_REVIEW_COUNT,
  RECENT_DAYS,
} from "@/lib/constants";

const STALE_TIME = 5 * 60 * 1000;

function getRecentCreatedAfter() {
  const since = new Date();
  since.setDate(since.getDate() - RECENT_DAYS);
  return since.toISOString();
}

export default async function HomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME },
    },
  });

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: ["places", "recent"],
      queryFn: () =>
        fetchPlaces({
          orderBy: "created_at",
          ascending: false,
          filter: { createdAfter: getRecentCreatedAfter() },
        }),
      initialPageParam: 0,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["places", "popular"],
      queryFn: () =>
        fetchPlaces({
          orderBy: "rating",
          ascending: false,
          filter: {
            minRating: POPULAR_RATING_THRESHOLD,
            minReviewCount: POPULAR_MIN_REVIEW_COUNT,
          },
        }),
      initialPageParam: 0,
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 px-4 pt-21 pb-23">
      <DubaiCookieBanner />
      <Suspense fallback={<PlaceListSkeleton />}>
        <HomeTabs />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PlaceList />
        </HydrationBoundary>
      </Suspense>
      <HomeFooter />
    </main>
  );
}
