import Link from "next/link";
import { MapPin, Tag, ThumbsUp, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KONA_CARD_LABELS } from "@/lib/constants";
import type { KonaCardStatus } from "@/types";

interface RestaurantCardProps {
  id: number;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  like_count: number | null;
  image_urls?: string[] | null;
}

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardProps }) {
  const status = (restaurant.kona_card_status ?? "unknown") as KonaCardStatus;

  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardContent className="flex gap-3 p-4">
          {restaurant.image_urls?.[0] ? (
            <img
              src={restaurant.image_urls[0]}
              alt=""
              className="size-16 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
              <UtensilsCrossed className="size-6 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium leading-snug">{restaurant.name}</h3>
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
              {restaurant.address}
            </p>

            {restaurant.category && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="size-3 shrink-0" />
                {restaurant.category}
              </p>
            )}

            {(restaurant.like_count ?? 0) > 0 && (
              <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="size-3" />
                  {restaurant.like_count}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
