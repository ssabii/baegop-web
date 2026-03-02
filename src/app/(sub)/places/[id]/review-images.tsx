"use client";

import { useState } from "react";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { optimizeSupabaseImageUrl } from "@/lib/image";

interface ReviewImagesProps {
  images: string[];
}

export function ReviewImages({ images }: ReviewImagesProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const urls = images.map((url) => optimizeSupabaseImageUrl(url));

  return (
    <>
      <div className="flex gap-2 overflow-x-auto scrollbar-none md:grid md:grid-cols-5">
        {images.map((url, i) => (
          <button
            key={i}
            type="button"
            className="w-1/3 shrink-0 cursor-pointer overflow-hidden rounded-lg md:w-auto md:shrink"
            onClick={() => {
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
      <ImageCarouselDialog
        images={urls}
        initialIndex={previewIndex}
        alt="리뷰 이미지"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}
