"use client";

import { Heart } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { PlaceCard } from "@/components/places";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
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
        <Spinner className="text-primary size-8" />
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
              <Heart className="text-primary size-12" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">찜한 장소가 없어요</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y p-4">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} className="py-4" />
        ))}
      </ul>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="text-primary size-6" />}
      </div>
    </>
  );
}
