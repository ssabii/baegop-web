"use client";

import { PlaceCard } from "@/components/places";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Heart } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useMyPlaces } from "./use-my-places";

export function MyPlaceList() {
  const { places, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMyPlaces();

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
        <Empty className="border-none">
          <EmptyHeader className="gap-1">
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-none bg-transparent"
            >
              <Heart className="size-12 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">찜한 장소가 없어요</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 divide-y">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} className="py-4" />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </>
  );
}
