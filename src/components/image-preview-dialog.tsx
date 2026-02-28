"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ImageCarouselDialogProps {
  images: string[];
  initialIndex?: number;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageCarouselDialog({
  images,
  initialIndex = 0,
  alt = "",
  open,
  onOpenChange,
}: ImageCarouselDialogProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialIndex);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // open 시 initialIndex로 리셋
  useEffect(() => {
    if (open) {
      setCurrent(initialIndex);
      api?.scrollTo(initialIndex, false);
    }
  }, [open, initialIndex, api]);

  // Track current slide
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || images.length === 0) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "이미지 미리보기"}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        background: "rgba(0, 0, 0, 0.8)",
        height: "100dvh",
        pointerEvents: "auto",
      }}
    >
      {/* Top bar — counter centered, close right */}
      <div className="relative flex shrink-0 items-center justify-end px-4 pt-4 pb-2">
        {images.length > 1 && (
          <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {current + 1} / {images.length}
          </span>
        )}
        <button
          type="button"
          onClick={close}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Carousel area */}
      <div className="relative flex flex-1 items-center overflow-hidden">
        <Carousel
          opts={{ startIndex: initialIndex }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {images.map((src, i) => (
              <CarouselItem
                key={i}
                className="flex items-center justify-center pl-0"
              >
                <img
                  src={src}
                  alt={alt ? `${alt} ${i + 1}` : ""}
                  className="max-h-[75dvh] max-w-full select-none object-contain"
                  draggable={false}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation arrows */}
        {images.length > 1 && current > 0 && (
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {images.length > 1 && current < images.length - 1 && (
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div
          style={{ paddingTop: 12, marginBottom: 48, flexShrink: 0 }}
          className="flex justify-center gap-2"
        >
          {images.map((_, i) => (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => api?.scrollTo(i)}
              onKeyDown={(e) => e.key === "Enter" && api?.scrollTo(i)}
              className={`block size-2 cursor-pointer rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

// Backward-compatible single-image wrapper
interface ImagePreviewDialogProps {
  src: string;
  alt?: string;
  className?: string;
  children: React.ReactNode;
}

export function ImagePreviewDialog({
  src,
  alt = "",
  className,
  children,
}: ImagePreviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "cursor-pointer"}
      >
        {children}
      </button>
      <ImageCarouselDialog
        images={[src]}
        alt={alt}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
