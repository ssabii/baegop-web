"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { toast } from "sonner";
import { createReview } from "../actions";

const MAX_IMAGES = 5;
const MAX_CONTENT_LENGTH = 300;

interface ReviewFormPageProps {
  placeId: string;
  naverPlaceId: string;
}

export function ReviewFormPage({ placeId, naverPlaceId }: ReviewFormPageProps) {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const isDirty = rating > 0 || content.length > 0 || selectedFiles.length > 0;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const valid = files.filter((f) => f.size <= maxSize);

    if (valid.length < files.length) {
      toast.warning("10MB를 초과하는 이미지는 제외되었습니다.");
    }

    const remaining = MAX_IMAGES - selectedFiles.length;
    const allowed = valid.slice(0, remaining);

    if (allowed.length < valid.length) {
      toast.warning(`이미지는 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다.`);
    }

    if (allowed.length > 0) {
      setSelectedFiles((prev) => [...prev, ...allowed]);
      setPreviews((prev) => [
        ...prev,
        ...allowed.map((f) => URL.createObjectURL(f)),
      ]);
    }

    e.target.value = "";
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (rating === 0) return;

    startTransition(async () => {
      let formData: FormData | undefined;
      if (selectedFiles.length > 0) {
        formData = new FormData();
        selectedFiles.forEach((file) => formData!.append("images", file));
      }

      await createReview(placeId, naverPlaceId, { rating, content }, formData);
      router.push(`/places/${naverPlaceId}`);
    });
  }

  async function handleBack() {
    if (isDirty) {
      const ok = await confirm({
        title: "리뷰 작성 취소",
        description: "작성 중인 내용이 사라집니다.\n닫으시겠습니까?",
        confirmLabel: "닫기",
      });
      if (!ok) return;
    }
    router.back();
  }

  return (
    <>
      <main className="mx-auto max-w-4xl p-4">
        <div className="space-y-6">
          {/* 별점 */}
          <div>
            <Label className="text-sm font-medium">별점</Label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-colors"
                >
                  <Star
                    className={`size-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 내용 */}
          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="review-content" className="text-sm font-medium">
                리뷰 내용
              </Label>
              <span className="text-xs text-muted-foreground">
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            <Textarea
              id="review-content"
              placeholder="맛, 분위기, 서비스 등 자유롭게 작성해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
              className="mt-2"
              rows={5}
              maxLength={MAX_CONTENT_LENGTH}
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <Label className="text-sm font-medium">사진</Label>
              <span className="text-xs text-muted-foreground">
                {selectedFiles.length}/{MAX_IMAGES}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  <button
                    type="button"
                    className="w-full cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => {
                      setPreviewIndex(i);
                      setPreviewOpen(true);
                    }}
                  >
                    <img
                      src={src}
                      alt={`미리보기 ${i + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-foreground p-0.5 text-background shadow-sm"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {selectedFiles.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="size-5" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFilesChange}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleBack}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={rating === 0 || isPending}
            >
              {isPending && <Spinner data-icon="inline-start" />}
              작성
            </Button>
          </div>
        </div>
      </main>

      {previews.length > 0 && (
        <ImageCarouselDialog
          images={previews}
          initialIndex={previewIndex}
          alt="이미지 미리보기"
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  );
}
