"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { optimizeSupabaseImageUrl } from "@/lib/image";

interface ImageSelectorProps {
  label: string;
  maxImages: number;
  keptImageUrls: string[];
  previews: string[];
  totalImageCount: number;
  compressingCount: number;
  disabled?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (index: number) => void;
  onPreview: (index: number) => void;
  onAddClick: () => void;
}

export function ImageSelector({
  label,
  maxImages,
  keptImageUrls,
  previews,
  totalImageCount,
  compressingCount,
  disabled = false,
  fileInputRef,
  onFilesChange,
  onRemoveExisting,
  onRemoveNew,
  onPreview,
  onAddClick,
}: ImageSelectorProps) {
  const showSingleAddButton = totalImageCount === 0;
  const canAddMore = totalImageCount + compressingCount < maxImages;

  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <Label className="text-base font-bold">{label}</Label>
        <span className="text-muted-foreground text-sm">
          {totalImageCount}/{maxImages}
        </span>
      </div>

      {showSingleAddButton ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onAddClick}
          className="text-muted-foreground hover:border-primary hover:text-primary mt-2 flex aspect-5/1 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {compressingCount > 0 ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </button>
      ) : (
        <div className="mt-2 grid grid-cols-5 gap-2">
          {keptImageUrls.map((url, i) => (
            <div key={url} className="relative">
              <button
                type="button"
                disabled={disabled}
                className="w-full cursor-pointer overflow-hidden rounded-lg disabled:pointer-events-none"
                onClick={() => onPreview(i)}
              >
                <img
                  src={optimizeSupabaseImageUrl(url, { width: 200 })}
                  decoding="async"
                  alt="기존 이미지"
                  className="aspect-square w-full object-cover"
                />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveExisting(url)}
                className="bg-foreground/80 text-background absolute top-1 right-1 rounded-full p-0.5 shadow-sm disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={src} className="relative">
              <button
                type="button"
                disabled={disabled}
                className="w-full cursor-pointer overflow-hidden rounded-lg disabled:pointer-events-none"
                onClick={() => onPreview(keptImageUrls.length + i)}
              >
                <img
                  src={src}
                  decoding="async"
                  alt={`미리보기 ${i + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveNew(i)}
                className="bg-foreground/80 text-background absolute top-1 right-1 rounded-full p-0.5 shadow-sm disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {canAddMore && (
            <button
              type="button"
              disabled={disabled}
              onClick={onAddClick}
              className="text-muted-foreground hover:border-primary hover:text-primary flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg border border-dashed transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {compressingCount > 0 ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" />
              )}
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={maxImages - totalImageCount > 1}
        accept="image/*"
        className="hidden"
        onChange={onFilesChange}
      />
    </div>
  );
}
