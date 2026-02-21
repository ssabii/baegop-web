"use client";

import { Fragment } from "react";
import { useInView } from "react-intersection-observer";
import { Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PlaceCard } from "@/components/places";
import { useMyPlaces } from "./use-my-places";

interface MyPlaceListProps {
  userId: string;
}

export function MyPlaceList({ userId }: MyPlaceListProps) {
  const { places, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMyPlaces(userId);

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
              <Building2 className="size-12" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">
              등록한 장소가 없어요
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-8">
        <div className="flex flex-col">
          {places.map((place, index) => (
            <Fragment key={place.id}>
              {index > 0 && <Separator className="my-4" />}
              <PlaceCard place={place} />
            </Fragment>
          ))}
        </div>
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </>
  );
}
