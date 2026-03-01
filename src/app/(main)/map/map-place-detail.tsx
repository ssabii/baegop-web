"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink, MapPin, Phone, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatShortAddress } from "@/lib/address";
import { optimizeNaverImageUrl } from "@/lib/image";
import type { NaverSearchResult } from "@/types";

interface MapPlaceDetailProps {
  item: NaverSearchResult;
}

export function MapPlaceDetail({ item }: MapPlaceDetailProps) {
  const [imgError, setImgError] = useState(false);
  const category = item.category?.split(">").pop()?.trim();

  return (
    <div className="px-4 pb-4">
      {/* Compact area — visible in 200px snap */}
      <div className="flex flex-col gap-0.5">
        <h3 className="truncate text-base font-bold">{item.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {category && (
            <span className="flex items-center gap-1">
              <Tag className="size-3 shrink-0" />
              <span className="truncate">{category}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {formatShortAddress(item.roadAddress || item.address)}
            </span>
          </span>
        </div>
      </div>

      {/* Expanded area — visible when full */}
      <div className="mt-4">
        {/* Thumbnail */}
        {item.imageUrl && !imgError ? (
          <img
            src={optimizeNaverImageUrl(
              item.imageUrl.replace(/^http:\/\//, "https://"),
            )}
            alt=""
            className="w-full rounded-lg object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-8 text-muted-foreground" />
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <Button asChild size="xl" className="flex-1">
            <Link href={`/places/${item.id}`}>
              <ExternalLink className="size-4" />
              자세히 보기
            </Link>
          </Button>
          {item.phone && (
            <Button asChild variant="outline" size="xl">
              <a href={`tel:${item.phone}`}>
                <Phone className="size-4" />
                전화
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
