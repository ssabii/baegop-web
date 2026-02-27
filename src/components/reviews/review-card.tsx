"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { formatRelativeDate } from "@/lib/date";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";

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
    review_images?: {
      url: string;
      display_order: number;
    }[];
  };
  onBeforeNavigate?: () => void;
}

export function ReviewCard({ review, onBeforeNavigate }: ReviewCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const sortedImages = (review.review_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order);
  const imageUrls = sortedImages.map((img) => img.url);

  const content = (
    <div className="space-y-2 py-3">
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
      {sortedImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none md:grid md:grid-cols-5">
          {sortedImages.map((img, i) => (
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
                src={img.url}
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
    <>
      {review.place ? (
        <Link
          href={`/places/${review.place.id}`}
          className="block rounded-xl p-3 -m-3 transition-colors hover:bg-accent"
          onClick={() => onBeforeNavigate?.()}
        >
          {content}
        </Link>
      ) : (
        content
      )}
      {sortedImages.length > 0 && (
        <ImageCarouselDialog
          images={imageUrls}
          initialIndex={previewIndex}
          alt="리뷰 이미지"
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  );
}
