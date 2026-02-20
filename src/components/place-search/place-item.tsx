import { useState } from "react";
import { Building2, MapPin, Tag } from "lucide-react";
import type { NaverSearchResult } from "@/types";

interface PlaceItemProps {
  item: NaverSearchResult;
  thumbnailSize?: "sm" | "lg";
  highlighted?: boolean;
  onClick?: () => void;
}

export function PlaceItem({
  item,
  thumbnailSize = "lg",
  highlighted,
  onClick,
}: PlaceItemProps) {
  const [imgError, setImgError] = useState(false);
  const isSmall = thumbnailSize === "sm";
  const thumbClass = isSmall ? "size-12" : "size-20";
  const nameClass = isSmall ? "text-sm font-bold" : "text-base font-bold";
  const metaClass = isSmall
    ? "text-xs font-medium text-muted-foreground"
    : "text-sm font-medium text-muted-foreground";
  const paddingClass = isSmall ? "px-3 py-2.5" : "px-1 py-3";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 ${paddingClass} text-left transition-colors ${
        highlighted ? "bg-accent" : "hover:bg-accent"
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={nameClass}>{item.name}</span>
        <span className={`flex items-center gap-1 ${metaClass}`}>
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {item.roadAddress || item.address}
          </span>
        </span>
        {item.category && (
          <span className={`flex items-center gap-1 ${metaClass}`}>
            <Tag className="size-3 shrink-0" />
            <span className="truncate">{item.category}</span>
          </span>
        )}
      </div>
      {item.imageUrl && !imgError ? (
        <img
          src={item.imageUrl.replace(/^http:\/\//, "https://")}
          alt=""
          className={`${thumbClass} shrink-0 rounded-lg object-cover`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`flex ${thumbClass} shrink-0 items-center justify-center rounded-lg bg-muted`}
        >
          <Building2 className="size-5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
}
