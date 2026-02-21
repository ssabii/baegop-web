"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ImagePlus, Star, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BottomActionBar } from "@/components/bottom-action-bar";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { SubHeader } from "@/components/sub-header";
import { toast } from "sonner";
import { updateReview } from "../../actions";

const MAX_IMAGES = 5;
const MAX_CONTENT_LENGTH = 300;

interface ReviewEditFormPageProps {
  review: {
    id: number;
    rating: number;
    content: string | null;
    review_images: { url: string; display_order: number }[];
  };
  naverPlaceId: string;
  place: {
    name: string;
    category: string | null;
    imageUrl: string | null;
  };
}

export function ReviewEditFormPage({
  review,
  naverPlaceId,
  place,
}: ReviewEditFormPageProps) {
  const router = useRouter();
  const confirm = useConfirmDialog();

  const existingUrls = review.review_images
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.url);

  const [rating, setRating] = useState(review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(review.content ?? "");
  const [keptImageUrls, setKeptImageUrls] = useState<string[]>(existingUrls);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const totalImageCount = keptImageUrls.length + selectedFiles.length;
  const allImages = [...keptImageUrls, ...previews];

  const isDirty =
    rating !== review.rating ||
    content !== (review.content ?? "") ||
    keptImageUrls.length !== existingUrls.length ||
    selectedFiles.length > 0;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const valid = files.filter((f) => f.size <= maxSize);

    if (valid.length < files.length) {
      toast.warning("10MB를 초과하는 이미지는 제외되었습니다.");
    }

    const remaining = MAX_IMAGES - totalImageCount;
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

  function removeExistingImage(url: string) {
    setKeptImageUrls((prev) => prev.filter((u) => u !== url));
  }

  function removeNewFile(index: number) {
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

      const deletedImageUrls = existingUrls.filter(
        (url) => !keptImageUrls.includes(url),
      );

      await updateReview(
        review.id,
        naverPlaceId,
        { rating, content },
        formData,
        deletedImageUrls.length > 0 ? deletedImageUrls : undefined,
      );
      router.replace(`/places/${naverPlaceId}`);
    });
  }

  async function handleBack() {
    if (isDirty) {
      const ok = await confirm({
        title: "리뷰 수정 취소",
        description: "수정 중인 내용이 사라집니다.\n닫으시겠습니까?",
        confirmLabel: "닫기",
      });
      if (!ok) return;
    }
    router.back();
  }

  return (
    <>
      <SubHeader title="리뷰 수정" onBack={handleBack} />

      <main className="mx-auto max-w-4xl px-4 pt-4 pb-23">
        <div className="space-y-6">
          {/* 가게 정보 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <h2 className="line-clamp-2 font-bold">{place.name}</h2>
              {place.category && (
                <p className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Tag className="size-3 shrink-0" />
                  <span className="truncate">{place.category}</span>
                </p>
              )}
            </div>
            {place.imageUrl ? (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="aspect-square size-17 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex aspect-square size-17 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Building2 className="size-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* 별점 */}
          <div>
            <Label className="text-base font-bold">얼마나 만족하시나요?</Label>
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
                    className={`size-7 ${
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
            <Label className="text-base font-bold">어떤 점이 좋았나요?</Label>
            <button
              type="button"
              onClick={() => {
                setDrawerContent(content);
                setContentDrawerOpen(true);
              }}
              className="mt-2 flex min-h-30 w-full rounded-lg border px-3 py-3 text-left text-base outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {content ? (
                <div className="w-full min-w-0 line-clamp-4 whitespace-pre-wrap text-left">
                  {content}
                </div>
              ) : (
                <div className="w-full text-left text-muted-foreground">
                  장소에 대한 자세한 리뷰를 남겨주세요
                </div>
              )}
            </button>
            <p className="mt-1 text-right text-sm text-muted-foreground">
              {content.length}/{MAX_CONTENT_LENGTH}
            </p>
          </div>
          <Drawer
            repositionInputs={false}
            open={contentDrawerOpen}
            onOpenChange={setContentDrawerOpen}
          >
            <DrawerContent>
              <DrawerTitle className="sr-only">리뷰 내용 작성</DrawerTitle>
              <div className="p-4">
                <Textarea
                  autoFocus
                  className="field-sizing-fixed resize-none"
                  placeholder="장소에 대한 자세한 리뷰를 남겨주세요"
                  value={drawerContent}
                  onChange={(e) =>
                    setDrawerContent(
                      e.target.value.slice(0, MAX_CONTENT_LENGTH),
                    )
                  }
                  onFocus={(e) => {
                    const el = e.currentTarget;
                    el.setSelectionRange(el.value.length, el.value.length);
                  }}
                  maxLength={MAX_CONTENT_LENGTH}
                  rows={5}
                />
                <p className="mt-2 text-right text-sm text-muted-foreground">
                  {drawerContent.length}/{MAX_CONTENT_LENGTH}
                </p>
              </div>
              <DrawerFooter>
                <Button
                  size="xl"
                  onClick={() => {
                    setContent(drawerContent);
                    setContentDrawerOpen(false);
                  }}
                >
                  확인
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* 이미지 */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <Label className="text-base font-bold">사진</Label>
              <span className="text-sm text-muted-foreground">
                {totalImageCount}/{MAX_IMAGES}
              </span>
            </div>
            {totalImageCount === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex aspect-5/1 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ImagePlus className="size-5" />
              </button>
            ) : (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {keptImageUrls.map((url, i) => (
                  <div key={url} className="relative">
                    <button
                      type="button"
                      className="w-full cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => {
                        setPreviewIndex(i);
                        setPreviewOpen(true);
                      }}
                    >
                      <img
                        src={url}
                        alt="기존 이미지"
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 rounded-full bg-foreground/80 p-0.5 text-background shadow-sm"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div key={src} className="relative">
                    <button
                      type="button"
                      className="w-full cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => {
                        setPreviewIndex(keptImageUrls.length + i);
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
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 rounded-full bg-foreground/80 p-0.5 text-background shadow-sm"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {totalImageCount < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <ImagePlus className="size-5" />
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFilesChange}
            />
          </div>
        </div>
      </main>

      <BottomActionBar>
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            onClick={handleBack}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            size="xl"
            className="flex-1"
            onClick={handleSubmit}
            disabled={rating === 0 || isPending}
          >
            {isPending && <Spinner data-icon="inline-start" />}
            수정
          </Button>
        </div>
      </BottomActionBar>

      {allImages.length > 0 && (
        <ImageCarouselDialog
          images={allImages}
          initialIndex={previewIndex}
          alt="이미지 미리보기"
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  );
}
