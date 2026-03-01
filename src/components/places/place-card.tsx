import { optimizeNaverImageUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/favorite-button";
import { KonaCardBadge } from "@/components/place-detail/kona-card-badge";
import type { KonaCardStatus } from "@/types";
import { Building2, MapPin, Star, Tag } from "lucide-react";
import Link from "next/link";

interface PlaceCardProps {
  id: string;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  image_urls?: string[] | null;
  avg_rating: number | null;
  review_count: number;
}

export function PlaceCard({
  place,
  className,
}: {
  place: PlaceCardProps;
  className?: string;
}) {
  const status = (place.kona_card_status ?? "unknown") as KonaCardStatus;

  return (
    <Link
      href={`/places/${place.id}`}
      className={cn("flex gap-3 transition-colors hover:bg-accent", className)}
    >
      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1">
            <h3 className="line-clamp-2 font-bold leading-snug text-left">
              {place.name}
            </h3>
          </div>
          {place.category && (
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Tag className="size-3 shrink-0" />
              <span className="truncate">{place.category}</span>
            </p>
          )}
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{place.address}</span>
          </p>
          <div className="flex items-center gap-2">
            {place.review_count > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
                <Star className="size-3 fill-current" />
                {place.avg_rating!.toFixed(1)}
                <span className="text-muted-foreground">
                  ({place.review_count})
                </span>
              </span>
            )}
          </div>
          <KonaCardBadge status={status} />
        </div>
      </div>

      <div className="relative shrink-0">
        {place.image_urls?.[0] ? (
          <img
            src={optimizeNaverImageUrl(place.image_urls[0])}
            alt={place.name}
            className="aspect-square size-28 rounded-lg object-cover"
          />
        ) : (
          <div className="flex aspect-square size-28 items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-6 text-muted-foreground" />
          </div>
        )}
        <FavoriteButton
          placeId={place.id}
          className="absolute top-1 right-1 size-8 text-white hover:bg-transparent active:bg-transparent fill-white"
        />
      </div>
    </Link>
  );
}
