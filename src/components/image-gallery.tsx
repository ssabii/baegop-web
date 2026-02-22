"use client";

import { useRef, useState } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export function ImageGallery({ images, alt = "" }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-muted">
        <Building2 className="size-12 text-muted-foreground" />
      </div>
    );
  }

  function scrollTo(index: number) {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setCurrent(clamped);
    scrollRef.current?.children[clamped]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            setCurrent(index);
          }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPreviewIndex(i);
                setPreviewOpen(true);
              }}
              className="w-full shrink-0 snap-center cursor-pointer"
            >
              <img
                src={src}
                alt={alt ? `${alt} ${i + 1}` : ""}
                className="h-48 w-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* 좌우 화살표 */}
        {images.length > 1 && (
          <>
            {current > 0 && (
              <button
                type="button"
                onClick={() => scrollTo(current - 1)}
                className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-opacity hover:bg-black/60"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {current < images.length - 1 && (
              <button
                type="button"
                onClick={() => scrollTo(current + 1)}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-opacity hover:bg-black/60"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </>
        )}

        {/* 인디케이터 */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`size-1.5 cursor-pointer rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <ImageCarouselDialog
        images={images}
        initialIndex={previewIndex}
        alt={alt}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}
