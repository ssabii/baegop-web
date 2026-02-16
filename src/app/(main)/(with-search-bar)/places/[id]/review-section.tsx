"use client";

import { useRef, useState, useTransition } from "react";
import {
  ImagePlus,
  Plus,
  Loader2,
  MessageSquarePlus,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { formatRelativeDate } from "@/lib/date";
import { toast } from "sonner";
import { createReview, deleteReview, updateReview } from "./actions";

interface ReviewData {
  id: number;
  rating: number;
  content: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
  review_images: {
    url: string;
    display_order: number;
  }[];
}

interface ReviewSectionProps {
  placeId: string;
  naverPlaceId: string;
  reviews: ReviewData[];
  currentUserId: string | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3.5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewImageCarousel({
  images,
}: {
  images: ReviewData["review_images"];
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const sorted = images
    .slice()
    .sort((a, b) => a.display_order - b.display_order);
  const urls = sorted.map((img) => img.url);

  return (
    <>
      <Carousel className="w-full">
        <CarouselContent>
          {sorted.map((img, i) => (
            <CarouselItem key={i} className="basis-auto">
              <button
                type="button"
                className="cursor-pointer overflow-hidden rounded-xl"
                onClick={() => {
                  setPreviewIndex(i);
                  setPreviewOpen(true);
                }}
              >
                <img
                  src={img.url}
                  alt={`리뷰 이미지 ${i + 1}`}
                  className="aspect-square h-32 object-cover"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
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

function ReviewCard({
  review,
  isOwner,
  naverPlaceId,
}: {
  review: ReviewData;
  isOwner: boolean;
  naverPlaceId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const confirm = useConfirmDialog();

  async function handleDelete() {
    const ok = await confirm({
      title: "리뷰 삭제",
      description: "삭제된 리뷰는 복구할 수 없습니다.\n정말 삭제하시겠습니까?",
      confirmLabel: "삭제",
      variant: "default",
    });
    if (!ok) return;

    startTransition(async () => {
      await deleteReview(review.id, naverPlaceId);
    });
  }

  const nickname = review.profiles?.nickname ?? "익명";

  return (
    <div className="py-3 space-y-2">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={review.profiles?.avatar_url ?? undefined} />
          <AvatarFallback>{nickname[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{nickname}</span>
            {isOwner && (
              <div className="flex gap-1 -mt-0.5 -mr-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setEditOpen(true)}
                >
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "삭제"
                  )}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StarRating rating={review.rating} />
            <span className="text-xs text-muted-foreground/60">
              {formatRelativeDate(review.created_at)}
            </span>
          </div>
        </div>
      </div>
      {review.content && (
        <p className="text-sm text-muted-foreground">{review.content}</p>
      )}
      {review.review_images.length > 0 && (
        <ReviewImageCarousel images={review.review_images} />
      )}
      {editOpen && (
        <ReviewEditDialog
          review={review}
          naverPlaceId={naverPlaceId}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}

function ReviewEditDialog({
  review,
  naverPlaceId,
  open,
  onOpenChange,
}: {
  review: ReviewData;
  naverPlaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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

  const isDirty =
    rating !== review.rating ||
    content !== (review.content ?? "") ||
    keptImageUrls.length !== existingUrls.length ||
    selectedFiles.length > 0;

  function resetForm() {
    setRating(review.rating);
    setHoverRating(0);
    setContent(review.content ?? "");
    setKeptImageUrls(existingUrls);
    setSelectedFiles([]);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
  }

  async function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isDirty) {
      const ok = await confirm({
        title: "리뷰 수정 취소",
        description: "수정 중인 내용이 사라집니다.\n닫으시겠습니까?",
        confirmLabel: "닫기",
      });
      if (!ok) return;
    }
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  const totalImageCount = keptImageUrls.length + selectedFiles.length;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const valid = files.filter((f) => f.size <= maxSize);

    if (valid.length < files.length) {
      toast.warning("10MB를 초과하는 이미지는 제외되었습니다.");
    }

    const remaining = 10 - totalImageCount;
    const allowed = valid.slice(0, remaining);

    if (allowed.length < valid.length) {
      toast.warning("이미지는 최대 10장까지 등록할 수 있습니다.");
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

  const [editPreviewOpen, setEditPreviewOpen] = useState(false);
  const [editPreviewIndex, setEditPreviewIndex] = useState(0);
  const allEditImages = [...keptImageUrls, ...previews];

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
      resetForm();
      onOpenChange(false);
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton>
          <DialogHeader className="text-left">
            <DialogTitle>리뷰 수정</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
              <Label
                htmlFor="edit-review-content"
                className="text-sm font-medium"
              >
                리뷰 내용
              </Label>
              <Textarea
                id="edit-review-content"
                placeholder="맛, 분위기, 서비스 등 자유롭게 작성해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            {/* 이미지 */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <Label className="text-sm font-medium">사진</Label>
                <span className="text-xs text-muted-foreground">
                  {totalImageCount}/10
                </span>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pt-1.5 pr-1.5">
                {keptImageUrls.map((url, i) => (
                  <div key={url} className="relative shrink-0">
                    <button
                      type="button"
                      className="cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => {
                        setEditPreviewIndex(i);
                        setEditPreviewOpen(true);
                      }}
                    >
                      <img
                        src={url}
                        alt="기존 이미지"
                        className="size-16 object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-foreground p-0.5 text-background shadow-sm"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div key={src} className="relative shrink-0">
                    <button
                      type="button"
                      className="cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => {
                        setEditPreviewIndex(keptImageUrls.length + i);
                        setEditPreviewOpen(true);
                      }}
                    >
                      <img
                        src={src}
                        alt={`미리보기 ${i + 1}`}
                        className="size-16 object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-foreground p-0.5 text-background shadow-sm"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {totalImageCount < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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

            {/* 제출 */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isPending}
                className="gap-2"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                수정
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {allEditImages.length > 0 && (
        <ImageCarouselDialog
          images={allEditImages}
          initialIndex={editPreviewIndex}
          alt="이미지 미리보기"
          open={editPreviewOpen}
          onOpenChange={setEditPreviewOpen}
        />
      )}
    </>
  );
}

function ReviewDialog({
  placeId,
  naverPlaceId,
}: {
  placeId: string;
  naverPlaceId: string;
}) {
  const confirm = useConfirmDialog();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = rating > 0 || content.length > 0 || selectedFiles.length > 0;

  function resetForm() {
    setRating(0);
    setHoverRating(0);
    setContent("");
    setSelectedFiles([]);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
  }

  async function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isDirty) {
      const ok = await confirm({
        title: "리뷰 작성 취소",
        description: "작성 중인 내용이 사라집니다.\n닫으시겠습니까?",
        confirmLabel: "닫기",
      });
      if (!ok) return;
    }
    if (!nextOpen) resetForm();
    setOpen(nextOpen);
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const valid = files.filter((f) => f.size <= maxSize);

    if (valid.length < files.length) {
      toast.warning("10MB를 초과하는 이미지는 제외되었습니다.", {
        position: "top-center",
      });
    }

    const remaining = 10 - selectedFiles.length;
    const allowed = valid.slice(0, remaining);

    if (allowed.length < valid.length) {
      toast.warning("이미지는 최대 10장까지 등록할 수 있습니다.", {
        position: "top-center",
      });
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

  const [createPreviewOpen, setCreatePreviewOpen] = useState(false);
  const [createPreviewIndex, setCreatePreviewIndex] = useState(0);

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
      resetForm();
      setOpen(false);
    });
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex justify-end">
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            리뷰 작성
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent showCloseButton>
        <DialogHeader className="text-left">
          <DialogTitle>리뷰 작성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            <Label htmlFor="review-content" className="text-sm font-medium">
              리뷰 내용
            </Label>
            <Textarea
              id="review-content"
              placeholder="맛, 분위기, 서비스 등 자유롭게 작성해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <Label className="text-sm font-medium">사진</Label>
              <span className="text-xs text-muted-foreground">
                {selectedFiles.length}/10
              </span>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pt-1.5 pr-1.5">
              {previews.map((src, i) => (
                <div key={src} className="relative shrink-0">
                  <button
                    type="button"
                    className="cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => {
                      setCreatePreviewIndex(i);
                      setCreatePreviewOpen(true);
                    }}
                  >
                    <img
                      src={src}
                      alt={`미리보기 ${i + 1}`}
                      className="size-16 object-cover"
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
              {selectedFiles.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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

          {/* 제출 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              작성
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    {previews.length > 0 && (
      <ImageCarouselDialog
        images={previews}
        initialIndex={createPreviewIndex}
        alt="이미지 미리보기"
        open={createPreviewOpen}
        onOpenChange={setCreatePreviewOpen}
      />
    )}
    </>
  );
}

export function ReviewSection({
  placeId,
  naverPlaceId,
  reviews,
  currentUserId,
}: ReviewSectionProps) {
  return (
    <div className="space-y-4">
      {currentUserId && (
        <ReviewDialog placeId={placeId} naverPlaceId={naverPlaceId} />
      )}

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <MessageSquarePlus className="size-8" />
          <p className="text-sm">첫 번째 리뷰를 남겨보세요!</p>
        </div>
      ) : (
        <div className="divide-y">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={currentUserId === review.user_id}
              naverPlaceId={naverPlaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
