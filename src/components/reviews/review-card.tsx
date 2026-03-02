"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { formatRelativeDate } from "@/lib/date";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    content: string | null;
    created_at: string | null;
    place: {
      id: string;
      name: string;
    } | null;
    image_urls?: string[] | null;
  };
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export function ReviewCard({ review, onClick, className }: ReviewCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const images = review.image_urls ?? [];
  const imageUrls = images.map((url) => optimizeSupabaseImageUrl(url));

  const content = (
    <div className={"space-y-2"}>
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold">
            {review.place?.name ?? "알 수 없는 장소"}
          </span>
          {review.place && (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-3.5 ${
                  star <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          {review.created_at && (
            <span className="text-xs text-muted-foreground/60">
              {formatRelativeDate(review.created_at)}
            </span>
          )}
        </div>
        {review.content && (
          <p className="line-clamp-2 text-sm text-secondary-foreground">
            {review.content}
          </p>
        )}
      </div>
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none md:grid md:grid-cols-5">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              className="w-1/3 shrink-0 cursor-pointer overflow-hidden rounded-lg md:w-auto md:shrink"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPreviewIndex(i);
                setPreviewOpen(true);
              }}
            >
              <img
                src={optimizeSupabaseImageUrl(url)}
                alt={`리뷰 이미지 ${i + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("transition-colors hover:bg-accent", className)}>
      {review.place ? (
        <Link
          href={`/places/${review.place.id}?tab=review`}
          className="block"
          onClick={(e) => onClick?.(e)}
        >
          {content}
        </Link>
      ) : (
        content
      )}
      {images.length > 0 && (
        <ImageCarouselDialog
          images={imageUrls}
          initialIndex={previewIndex}
          alt="리뷰 이미지"
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  );
}
