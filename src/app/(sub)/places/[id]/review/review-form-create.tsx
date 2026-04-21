"use client";

import { Building2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { ContentDrawerEditor } from "@/components/forms/content-drawer-editor";
import { ImageSelector } from "@/components/forms/image-selector";
import { StarRatingPicker } from "@/components/forms/star-rating-picker";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { SubHeader } from "@/components/sub-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useImageForm } from "@/hooks/use-image-form";
import { useCreateReview } from "./use-create-review";

const MAX_IMAGES = 5;
const MAX_CONTENT_LENGTH = 300;

interface ReviewFormCreateProps {
  naverPlaceId: string;
  place: {
    name: string;
    category: string | null;
    imageUrl: string | null;
  };
}

export function ReviewFormCreate({
  naverPlaceId,
  place,
}: ReviewFormCreateProps) {
  const router = useRouter();
  const confirm = useConfirmDialog();

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  const imageForm = useImageForm({ maxImages: MAX_IMAGES });

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { mutate, isPending } = useCreateReview(naverPlaceId);
  const isBusy = isPending || imageForm.compressingCount > 0;
  const isDirty =
    rating > 0 || content.length > 0 || imageForm.hasImageChanges;

  function handleSubmit() {
    if (rating === 0) return;
    mutate({ rating, content, files: imageForm.selectedFiles });
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

  function openPreview(index: number) {
    setPreviewIndex(index);
    setPreviewOpen(true);
  }

  return (
    <>
      <SubHeader title="리뷰 작성" onBack={handleBack} />

      <main className="mx-auto w-full max-w-4xl px-4 pt-4 pb-32">
        <div className="space-y-6">
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

          <div>
            <Label className="text-base font-bold">얼마나 만족하시나요?</Label>
            <StarRatingPicker
              value={rating}
              onChange={setRating}
              disabled={isBusy}
            />
          </div>

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
            작성
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
