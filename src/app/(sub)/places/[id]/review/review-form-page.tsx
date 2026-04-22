"use client";

import { Building2, Star, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { ContentDrawerEditor } from "@/components/forms/content-drawer-editor";
import { ImageSelector } from "@/components/forms/image-selector";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { SubHeader } from "@/components/sub-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useImageForm } from "@/hooks/use-image-form";
import { useCreateReview } from "./use-create-review";
import { useUpdateReview } from "./use-update-review";

const MAX_IMAGES = 5;
const MAX_CONTENT_LENGTH = 300;

type ReviewFormPageProps = {
  naverPlaceId: string;
  place: {
    name: string;
    category: string | null;
    imageUrl: string | null;
  };
} & (
  | { mode: "create" }
  | {
      mode: "edit";
      review: {
        id: number;
        rating: number;
        content: string | null;
        image_urls: string[];
      };
    }
);

export function ReviewFormPage(props: ReviewFormPageProps) {
  const { naverPlaceId, place } = props;
  const isEdit = props.mode === "edit";
  const review = isEdit ? props.review : null;

  const router = useRouter();
  const confirm = useConfirmDialog();

  const [rating, setRating] = useState(review?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(review?.content ?? "");

  const imageForm = useImageForm({
    initialImageUrls: review?.image_urls ?? [],
    maxImages: MAX_IMAGES,
  });

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const createReview = useCreateReview(naverPlaceId);
  const updateReview = useUpdateReview(naverPlaceId, review?.id ?? -1);
  const { mutate, isPending } = isEdit ? updateReview : createReview;

  const isBusy = isPending || imageForm.compressingCount > 0;
  const isDirty = isEdit
    ? rating !== review!.rating ||
      content !== (review!.content ?? "") ||
      imageForm.hasImageChanges
    : rating > 0 || content.length > 0 || imageForm.hasImageChanges;

  function handleSubmit() {
    if (rating === 0) return;

    if (isEdit) {
      (mutate as typeof updateReview.mutate)({
        rating,
        content,
        keptImageUrls: imageForm.keptImageUrls,
        files: imageForm.selectedFiles,
      });
    } else {
      (mutate as typeof createReview.mutate)({
        rating,
        content,
        files: imageForm.selectedFiles,
      });
    }
  }

  async function handleBack() {
    if (isDirty) {
      const ok = await confirm({
        title: isEdit ? "리뷰 수정 취소" : "리뷰 작성 취소",
        description: isEdit
          ? "수정 중인 내용이 사라집니다.\n닫으시겠습니까?"
          : "작성 중인 내용이 사라집니다.\n닫으시겠습니까?",
        confirmLabel: "닫기",
      });
      if (!ok) return;
    }
    router.back();
  }

  function openPreview(index: number) {
    setPreviewIndex(index);
    setPreviewOpen(true);
  }

  return (
    <>
      <SubHeader
        title={isEdit ? "리뷰 수정" : "리뷰 작성"}
        onBack={handleBack}
      />

      <main className="mx-auto w-full max-w-4xl px-4 pt-4 pb-32">
        <div className="space-y-6">
          {/* 가게 정보 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <h2 className="line-clamp-2 font-bold">{place.name}</h2>
              {place.category && (
                <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
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
              <div className="bg-muted flex aspect-square size-17 shrink-0 items-center justify-center rounded-lg">
                <Building2 className="text-muted-foreground size-5" />
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
                  disabled={isBusy}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-colors disabled:pointer-events-none disabled:opacity-50"
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
              disabled={isBusy}
              onClick={() => setContentDrawerOpen(true)}
              className="focus-visible:border-ring focus-visible:ring-ring/50 mt-2 flex min-h-30 w-full rounded-lg border px-3 py-3 text-left text-base outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
            >
              {content ? (
                <div className="line-clamp-4 w-full min-w-0 text-left whitespace-pre-wrap">
                  {content}
                </div>
              ) : (
                <div className="text-muted-foreground w-full text-left">
                  장소에 대한 자세한 리뷰를 남겨주세요
                </div>
              )}
            </button>
            <p className="text-muted-foreground mt-1 text-right text-sm">
              {content.length}/{MAX_CONTENT_LENGTH}
            </p>
          </div>
          <ContentDrawerEditor
            open={contentDrawerOpen}
            onOpenChange={setContentDrawerOpen}
            srTitle="리뷰 내용 작성"
            initialValue={content}
            onConfirm={setContent}
            placeholder="장소에 대한 자세한 리뷰를 남겨주세요"
            maxLength={MAX_CONTENT_LENGTH}
            rows={5}
          />

          {/* 이미지 */}
          <ImageSelector
            label="사진"
            maxImages={MAX_IMAGES}
            keptImageUrls={imageForm.keptImageUrls}
            previews={imageForm.previews}
            totalImageCount={imageForm.totalImageCount}
            compressingCount={imageForm.compressingCount}
            disabled={isBusy}
            fileInputRef={imageForm.fileInputRef}
            onFilesChange={imageForm.handleFilesChange}
            onRemoveExisting={imageForm.removeExistingImage}
            onRemoveNew={imageForm.removeNewFile}
            onPreview={openPreview}
            onAddClick={imageForm.openFilePicker}
          />
        </div>
      </main>

      <BottomActionBar>
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            onClick={handleBack}
            disabled={isBusy}
          >
            취소
          </Button>
          <Button
            size="xl"
            className="flex-1 transition-none has-[>svg]:px-8"
            onClick={handleSubmit}
            disabled={rating === 0 || isBusy}
          >
            {isPending && <Spinner />}
            {isEdit ? "수정" : "작성"}
          </Button>
        </div>
      </BottomActionBar>

      {imageForm.allImages.length > 0 && (
        <ImageCarouselDialog
          images={imageForm.allImages}
          initialIndex={previewIndex}
          alt="이미지 미리보기"
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  );
}
