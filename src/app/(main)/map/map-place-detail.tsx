"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink, MapPin, Phone, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      {/* Card */}
      <div className="flex gap-3">
        {/* Thumbnail */}
        {item.imageUrl && !imgError ? (
          <img
            src={optimizeNaverImageUrl(
              item.imageUrl.replace(/^http:\/\//, "https://"),
            )}
            alt=""
            className="size-20 shrink-0 rounded-lg object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-5 text-muted-foreground" />
          </div>
        )}

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-base font-bold">{item.name}</h3>
          {category && (
            <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Tag className="size-3 shrink-0" />
              <span className="truncate">{category}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {item.roadAddress || item.address}
            </span>
          </span>
        </div>
      </div>

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
  );
}
