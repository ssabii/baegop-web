"use client";

import { useInView } from "react-intersection-observer";
import { Spinner } from "@/components/ui/spinner";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { PlaceCard, EmptyPlace } from "@/components/places";
import { useAllPlaces } from "./use-all-places";

export function AllPlaceList() {
  useScrollRestoration();

  const { places, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAllPlaces();

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyPlace />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col divide-y">
        {places.map((place) => (
          <PlaceCard place={place} key={place.id} className="py-4" />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </>
  );
}
