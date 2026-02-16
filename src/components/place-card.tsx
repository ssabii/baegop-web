import Link from "next/link";
import { MapPin, Tag, ThumbsUp, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KONA_CARD_LABELS } from "@/lib/constants";
import type { KonaCardStatus } from "@/types";

interface PlaceCardProps {
  id: number;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  like_count: number | null;
  image_urls?: string[] | null;
}

export function PlaceCard({
  place,
}: {
  place: PlaceCardProps;
}) {
  const status = (place.kona_card_status ?? "unknown") as KonaCardStatus;

  return (
    <Link href={`/places/${place.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardContent className="flex gap-3 p-4">
          {place.image_urls?.[0] ? (
            <img
              src={place.image_urls[0]}
              alt={place.name}
              className="size-36 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
              <UtensilsCrossed className="size-6 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium leading-snug">{place.name}</h3>
              {status !== "unknown" && (
                <Badge
                  variant={status === "available" ? "default" : "destructive"}
                  className="shrink-0 text-xs"
                >
                  {KONA_CARD_LABELS[status]}
                </Badge>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {place.address}
            </p>

            {place.category && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="size-3 shrink-0" />
                {place.category}
              </p>
            )}

            {(place.like_count ?? 0) > 0 && (
              <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="size-3" />
                  {place.like_count}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
