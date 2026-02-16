import Link from "next/link";
import { MapPin, Star, Tag, UtensilsCrossed } from "lucide-react";
import type { KonaCardStatus } from "@/types";

interface PlaceCardProps {
  id: number;
  naver_place_id: string | null;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  image_urls?: string[] | null;
}

export function PlaceCard({ place }: { place: PlaceCardProps }) {
  const status = (place.kona_card_status ?? "unknown") as KonaCardStatus;

  return (
    <Link
      href={`/places/${place.naver_place_id ?? place.id}`}
      className="flex h-[7.5rem] gap-3 border-b border-border py-3 last:border-b-0"
    >
      {place.image_urls?.[0] ? (
        <img
          src={place.image_urls[0]}
          alt={place.name}
          className="h-full w-24 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-full w-24 shrink-0 items-center justify-center rounded-lg bg-muted">
          <UtensilsCrossed className="size-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
        <div className="space-y-1">
          <h3 className="line-clamp-2 font-bold leading-snug">{place.name}</h3>
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
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
            <Star className="size-3 fill-current" />
            4.2
          </span>
          {status !== "unknown" && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                status === "available"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <img
                src="/icons/kona.png"
                alt="코나카드"
                className="size-3.5 rounded-sm"
              />
              {status === "available" ? "결제가능" : "결제불가"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
