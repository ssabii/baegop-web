"use client";

import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { PackageOpen, TrendingUp } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { PlaceCard } from "@/components/places";
import { usePlaces } from "./use-places";

export function PlaceList() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "recent";

  useScrollRestoration();

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
    const emptyConfig =
      tab === "recent"
        ? {
            icon: PackageOpen,
            title: "최근에 등록된 장소가 없어요",
            description: "장소 검색 후 장소를 등록해보세요",
          }
        : tab === "popular"
          ? {
              icon: TrendingUp,
              title: "인기 장소가 없어요",
              description: "장소에 리뷰를 작성해보세요",
            }
          : {
              icon: PackageOpen,
              title: "등록된 장소가 없어요",
              description: "장소 검색 후 장소를 등록해보세요",
            };

    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty className="border-none">
          <EmptyHeader className="gap-1">
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-none bg-transparent"
            >
              <emptyConfig.icon className="size-12 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">{emptyConfig.title}</EmptyTitle>
            <EmptyDescription>{emptyConfig.description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
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
