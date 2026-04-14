"use client";

import { MapPinOff, MapPin } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PlaceCard } from "@/components/places";
import { PlaceCardSkeleton } from "@/components/places/place-card-skeleton";
import { useGeolocation } from "@/hooks/use-geolocation";
import { SEOUL_CITY_HALL_LOCATION } from "@/lib/constants";
import type { NaverSearchResult } from "@/types";
import type { PlaceCardProps } from "@/components/places/place-card";
import { useRecommendPlaces } from "./use-recommend-places";

function toPlaceCardProps(place: NaverSearchResult): PlaceCardProps {
  return {
    id: place.id,
    name: place.name,
    address: place.roadAddress || place.address,
    category: place.category,
    image_urls: place.imageUrl ? [place.imageUrl] : null,
  };
}

function RecommendPlacesSkeleton() {
  return (
    <div className="flex flex-col divide-y">
      {Array.from({ length: 5 }, (_, i) => (
        <PlaceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecommendPlaces() {
  const { coords, loading: geoLoading } = useGeolocation();

  const location = coords ?? SEOUL_CITY_HALL_LOCATION;
  const { places, isLoading } = useRecommendPlaces(location.lat, location.lng);

  if (geoLoading || isLoading) {
    return (
      <section>
        <div className="flex items-center gap-1.5 py-2">
          <MapPin className="text-primary size-4" />
          <h2 className="text-base font-bold">내 주변 추천</h2>
        </div>
        <RecommendPlacesSkeleton />
      </section>
    );
  }

  if (places.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-1.5 py-2">
          <MapPin className="text-primary size-4" />
          <h2 className="text-base font-bold">내 주변 추천</h2>
        </div>
        <Empty className="border-none">
          <EmptyHeader className="gap-1">
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-none bg-transparent"
            >
              <MapPinOff className="text-primary size-12" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">추천할 장소가 없어요</EmptyTitle>
            <EmptyDescription>
              현재 위치 기준으로 장소를 추천할 수 없어요
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-1.5 py-2">
        <MapPin className="text-primary size-4" />
        <h2 className="text-base font-bold">내 주변 추천</h2>
      </div>
      <ul className="flex flex-col divide-y">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={toPlaceCardProps(place)}
            className="py-4"
          />
        ))}
      </ul>
    </section>
  );
}
