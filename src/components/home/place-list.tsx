"use client";

import { Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { PlaceCard, EmptyPlace } from "@/components/places";
import { usePlaces } from "./use-places";

export function PlaceList() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "recent";

  const { places, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePlaces(tab);

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
      <div className="flex flex-col">
        {places.map((place, index) => (
          <Fragment key={place.id}>
            {index > 0 && <Separator className="my-4" />}
            <PlaceCard place={place} />
          </Fragment>
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </>
  );
}
