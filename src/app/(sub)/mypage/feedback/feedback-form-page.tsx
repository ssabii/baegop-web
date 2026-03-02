"use client";

import { BottomActionBar } from "@/components/bottom-action-bar";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { SubHeader } from "@/components/sub-header";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_CATEGORY_PLACEHOLDERS,
  MAX_FEEDBACK_CONTENT_LENGTH,
  MAX_FEEDBACK_IMAGES,
  MIN_FEEDBACK_CONTENT_LENGTH,
} from "@/lib/constants";
import { compressImage, optimizeSupabaseImageUrl } from "@/lib/image";
import type { FeedbackCategory, FeedbackWithImages } from "@/types";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateFeedback } from "./use-create-feedback";
import { useUpdateFeedback } from "./use-update-feedback";

type FeedbackFormPageProps =
  | { mode: "create" }
  | {
      mode: "edit";
      feedback: FeedbackWithImages;
    };

export function FeedbackFormPage(props: FeedbackFormPageProps) {
  const isEdit = props.mode === "edit";
  const feedback = isEdit ? props.feedback : null;

  const existingUrls = feedback
    ? feedback.feedback_images
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => img.url)
    : [];

  const router = useRouter();
  const confirm = useConfirmDialog();

  const [category, setCategory] = useState<FeedbackCategory>(
    feedback?.category ?? "bug",
  );
  const [content, setContent] = useState(feedback?.content ?? "");
  const [keptImageUrls, setKeptImageUrls] = useState<string[]>(existingUrls);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressingCount, setCompressingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef(previews);

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const createFeedback = useCreateFeedback();
  const updateFeedback = useUpdateFeedback(feedback?.id ?? -1);
  const { mutate, isPending } = isEdit ? updateFeedback : createFeedback;

  const totalImageCount = keptImageUrls.length + selectedFiles.length;
  const allImages = [...keptImageUrls, ...previews];

  const isDirty = isEdit
    ? category !== feedback!.category ||
      content !== feedback!.content ||
      keptImageUrls.length !== existingUrls.length ||
      selectedFiles.length > 0
    : content.length > 0 || selectedFiles.length > 0;

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const valid = files.filter((f) => f.size <= maxSize);

    if (valid.length < files.length) {
      toast.warning("10MB를 초과하는 이미지는 제외되었습니다.");
    }

    const remaining = MAX_FEEDBACK_IMAGES - totalImageCount;
    const allowed = valid.slice(0, remaining);

    if (allowed.length < valid.length) {
      toast.warning(
        `이미지는 최대 ${MAX_FEEDBACK_IMAGES}장까지 등록할 수 있습니다.`,
      );
    }

    if (allowed.length > 0) {
      setCompressingCount(allowed.length);
      const compressed = await Promise.all(
        allowed.map(async (file) => {
          const result = await compressImage(file);
          setCompressingCount((prev) => prev - 1);
          return result;
        }),
      );
      setSelectedFiles((prev) => [...prev, ...compressed]);
      setPreviews((prev) => [
        ...prev,
        ...compressed.map((f) => URL.createObjectURL(f)),
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
    if (content.length < MIN_FEEDBACK_CONTENT_LENGTH) return;

    if (isEdit) {
      (mutate as typeof updateFeedback.mutate)({
        category,
        content,
        keptImageUrls,
        files: selectedFiles,
      });
    } else {
      (mutate as typeof createFeedback.mutate)({
        category,
        content,
        files: selectedFiles,
      });
    }
  }

  async function handleBack() {
    if (isDirty) {
      const ok = await confirm({
        title: isEdit ? "피드백 수정 취소" : "피드백 작성 취소",
        description: isEdit
          ? "수정 중인 내용이 사라집니다.\n닫으시겠습니까?"
          : "작성 중인 내용이 사라집니다.\n닫으시겠습니까?",
        confirmLabel: "닫기",
      });
      if (!ok) return;
    }
    router.back();
  }

  return (
    <>
      <SubHeader
        title={isEdit ? "피드백 수정" : "피드백 작성"}
        onBack={handleBack}
      />

      <main className="max-w-4xl mx-auto w-full px-4 pt-4 pb-32">
        <div className="space-y-6">
          {/* 카테고리 */}
          <div>
            <Label className="text-base font-bold">카테고리</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as FeedbackCategory)}
              disabled={isPending || compressingCount > 0}
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

          {/* 내용 */}
          <div>
            <Label className="text-base font-bold">내용</Label>
            <button
              type="button"
              disabled={isPending || compressingCount > 0}
              onClick={() => {
                setDrawerContent(content);
                setContentDrawerOpen(true);
              }}
              className="mt-2 flex min-h-30 w-full rounded-lg border px-3 py-3 text-left text-base outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
            >
              {content ? (
                <div className="w-full min-w-0 line-clamp-4 whitespace-pre-wrap text-left">
                  {content}
                </div>
              ) : (
                <div className="w-full whitespace-pre-wrap text-left text-muted-foreground">
                  {FEEDBACK_CATEGORY_PLACEHOLDERS[category]}
                </div>
              )}
            </button>
            <p className="mt-1 text-right text-sm text-muted-foreground">
              (최소 {MIN_FEEDBACK_CONTENT_LENGTH}자) {content.length}/
              {MAX_FEEDBACK_CONTENT_LENGTH}
            </p>
          </div>
          <Drawer
            repositionInputs={false}
            open={contentDrawerOpen}
            onOpenChange={setContentDrawerOpen}
          >
            <DrawerContent>
              <div className="max-w-4xl mx-auto w-full p-4">
                <DrawerTitle className="sr-only">피드백 내용 작성</DrawerTitle>
                <Textarea
                  autoFocus
                  className="field-sizing-fixed resize-none"
                  placeholder={FEEDBACK_CATEGORY_PLACEHOLDERS[category]}
                  value={drawerContent}
                  onChange={(e) =>
                    setDrawerContent(
                      e.target.value.slice(0, MAX_FEEDBACK_CONTENT_LENGTH),
                    )
                  }
                  onFocus={(e) => {
                    const el = e.currentTarget;
                    el.setSelectionRange(el.value.length, el.value.length);
                  }}
                  maxLength={MAX_FEEDBACK_CONTENT_LENGTH}
                  rows={8}
                />
                <p className="mt-2 text-right text-sm text-muted-foreground">
                  {drawerContent.length}/{MAX_FEEDBACK_CONTENT_LENGTH}
                </p>
                <Button
                  className="w-full mt-4"
                  size="xl"
                  onClick={() => {
                    setContent(drawerContent);
                    setContentDrawerOpen(false);
                  }}
                >
                  확인
                </Button>
              </div>
            </DrawerContent>
          </Drawer>

          {/* 이미지 */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <Label className="text-base font-bold">사진</Label>
              <span className="text-sm text-muted-foreground">
                {totalImageCount}/{MAX_FEEDBACK_IMAGES}
              </span>
            </div>
            {totalImageCount === 0 ? (
              <button
                type="button"
                disabled={isPending || compressingCount > 0}
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex aspect-5/1 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
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
                      disabled={isPending || compressingCount > 0}
                      className="w-full cursor-pointer overflow-hidden rounded-lg disabled:pointer-events-none"
                      onClick={() => {
                        setPreviewIndex(i);
                        setPreviewOpen(true);
                      }}
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
                      disabled={isPending || compressingCount > 0}
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 rounded-full bg-foreground/80 p-0.5 text-background shadow-sm disabled:pointer-events-none disabled:opacity-50"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div key={src} className="relative">
                    <button
                      type="button"
                      disabled={isPending || compressingCount > 0}
                      className="w-full cursor-pointer overflow-hidden rounded-lg disabled:pointer-events-none"
                      onClick={() => {
                        setPreviewIndex(keptImageUrls.length + i);
                        setPreviewOpen(true);
                      }}
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
                      disabled={isPending || compressingCount > 0}
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 rounded-full bg-foreground/80 p-0.5 text-background shadow-sm disabled:pointer-events-none disabled:opacity-50"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {totalImageCount + compressingCount < MAX_FEEDBACK_IMAGES && (
                  <button
                    type="button"
                    disabled={isPending || compressingCount > 0}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
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
              multiple={MAX_FEEDBACK_IMAGES - totalImageCount > 1}
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
            disabled={isPending || compressingCount > 0}
          >
            취소
          </Button>
          <Button
            size="xl"
            className="flex-1 transition-none has-[>svg]:px-8"
            onClick={handleSubmit}
            disabled={
              content.length < MIN_FEEDBACK_CONTENT_LENGTH ||
              isPending ||
              compressingCount > 0
            }
          >
            {isPending && <Spinner />}
            {isEdit ? "수정" : "작성"}
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
