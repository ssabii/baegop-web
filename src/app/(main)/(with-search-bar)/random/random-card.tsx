"use client";

import Link from "next/link";
import { Building2, MapPin, Star, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KonaCardStatus } from "@/types";
import type { RandomPlace } from "./types";

interface RandomCardProps {
  place: RandomPlace;
}

export function RandomCard({ place }: RandomCardProps) {
  const status = (place.kona_card_status ?? "unknown") as KonaCardStatus;
  const thumbnail = place.image_urls?.[0];

  return (
    <Link href={`/places/${place.id}`} className="block overflow-hidden">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={place.name}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-muted">
          <Building2 className="size-12 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-2 p-4">
        {status !== "unknown" && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-1 text-xs font-medium",
              {
                "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300":
                  status === "available",
                "bg-muted text-muted-foreground": status !== "available",
              },
            )}
          >
            <img
              src="/icons/kona.png"
              alt="코나카드"
              className="size-3 rounded-full"
            />
            {status === "available" ? "결제가능" : "결제불가"}
          </span>
        )}

        <h2 className="text-xl font-bold">{place.name}</h2>

        {place.category && (
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="size-4 shrink-0" />
            {place.category}
          </p>
        )}

        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{place.address}</span>
        </p>

        {place.review_count > 0 && place.avg_rating != null && (
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">
              {place.avg_rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({place.review_count})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
