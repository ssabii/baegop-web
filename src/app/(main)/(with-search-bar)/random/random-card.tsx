"use client";

import Link from "next/link";
import { Building2, MapPin, Star, Tag } from "lucide-react";
import type { KonaCardStatus } from "@/types";
import type { RandomPlace } from "./types";
import { KonaCardBadge } from "@/components/place-detail/kona-card-badge";

interface RandomCardProps {
  place: RandomPlace;
}

export function RandomCard({ place }: RandomCardProps) {
  const status = (place.kona_card_status ?? "unknown") as KonaCardStatus;
  const thumbnail = place.image_urls?.[0];

  return (
    <Link href={`/places/${place.id}`} className="block overflow-hidden px-4">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={place.name}
          className="h-48 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="bg-muted flex h-48 w-full items-center justify-center rounded-xl">
          <Building2 className="text-muted-foreground size-12" />
        </div>
      )}

      <div className="space-y-2 py-4">
        <h2 className="text-xl font-bold">{place.name}</h2>

        {place.category && (
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Tag className="size-4 shrink-0" />
            {place.category}
          </p>
        )}

        <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{place.address}</span>
        </p>

        {place.review_count > 0 && place.avg_rating != null && (
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">
              {place.avg_rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-sm">
              ({place.review_count})
            </span>
          </div>
        )}

        <KonaCardBadge status={status} />
      </div>
    </Link>
  );
}
