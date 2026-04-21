"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useImageForm } from "@/hooks/use-image-form";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_CATEGORY_PLACEHOLDERS,
  MAX_FEEDBACK_CONTENT_LENGTH,
  MAX_FEEDBACK_IMAGES,
  MIN_FEEDBACK_CONTENT_LENGTH,
} from "@/lib/constants";
import { useUpdateFeedback } from "./use-update-feedback";
import type { FeedbackCategory, FeedbackWithImages } from "@/types";

interface FeedbackFormEditProps {
  feedback: FeedbackWithImages;
}

export function FeedbackFormEdit({ feedback }: FeedbackFormEditProps) {
  const router = useRouter();
  const confirm = useConfirmDialog();

  const [category, setCategory] = useState<FeedbackCategory>(feedback.category);
  const [content, setContent] = useState(feedback.content);

  const imageForm = useImageForm({
    initialImageUrls: feedback.image_urls ?? [],
    maxImages: MAX_FEEDBACK_IMAGES,
  });

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { mutate, isPending } = useUpdateFeedback(feedback.id);
  const isBusy = isPending || imageForm.compressingCount > 0;
  const isDirty =
    category !== feedback.category ||
    content !== feedback.content ||
    imageForm.hasImageChanges;

  function handleSubmit() {
    if (content.length < MIN_FEEDBACK_CONTENT_LENGTH) return;
    mutate({
      category,
      content,
      keptImageUrls: imageForm.keptImageUrls,
      files: imageForm.selectedFiles,
    });
  }

  async function handleBack() {
    if (isDirty) {
      const ok = await confirm({
        title: "피드백 수정 취소",
        description: "수정 중인 내용이 사라집니다.\n닫으시겠습니까?",
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
      <SubHeader title="피드백 수정" onBack={handleBack} />

      <main className="mx-auto w-full max-w-4xl px-4 pt-4 pb-32">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-bold">카테고리</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as FeedbackCategory)}
              disabled={isBusy}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {FEEDBACK_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-bold">내용</Label>
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
                <div className="text-muted-foreground w-full text-left whitespace-pre-wrap">
                  {FEEDBACK_CATEGORY_PLACEHOLDERS[category]}
                </div>
              )}
            </button>
            <p className="text-muted-foreground mt-1 text-right text-sm">
              (최소 {MIN_FEEDBACK_CONTENT_LENGTH}자) {content.length}/
              {MAX_FEEDBACK_CONTENT_LENGTH}
            </p>
          </div>
          <ContentDrawerEditor
            open={contentDrawerOpen}
            onOpenChange={setContentDrawerOpen}
            srTitle="피드백 내용 작성"
            initialValue={content}
            onConfirm={setContent}
            placeholder={FEEDBACK_CATEGORY_PLACEHOLDERS[category]}
            maxLength={MAX_FEEDBACK_CONTENT_LENGTH}
            rows={8}
          />

          <ImageSelector
            label="사진"
            maxImages={MAX_FEEDBACK_IMAGES}
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
            disabled={content.length < MIN_FEEDBACK_CONTENT_LENGTH || isBusy}
          >
            {isPending && <Spinner />}
            수정
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
