"use client";

import { useRef, useState, useTransition } from "react";
import {
  ImagePlus,
  Loader2,
  MessageSquarePlus,
  Star,
  Trash2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { createReview, deleteReview } from "./actions";

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
          className={`size-4 ${
            star <= rating
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
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

  function handleDelete() {
    startTransition(async () => {
      await deleteReview(review.id, naverPlaceId);
    });
  }

  const nickname = review.profiles?.nickname ?? "익명";

  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={review.profiles?.avatar_url ?? undefined} />
        <AvatarFallback>{nickname[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{nickname}</span>
            <StarRating rating={review.rating} />
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
        {review.content && (
          <p className="text-sm text-muted-foreground">{review.content}</p>
        )}
        {review.review_images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pt-1">
            {review.review_images
              .sort((a, b) => a.display_order - b.display_order)
              .map((img, i) => (
                <ImagePreviewDialog key={i} src={img.url} alt={`리뷰 이미지 ${i + 1}`}>
                  <img
                    src={img.url}
                    alt={`리뷰 이미지 ${i + 1}`}
                    className="size-20 shrink-0 rounded-lg object-cover"
                  />
                </ImagePreviewDialog>
              ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground/60">
          {new Date(review.created_at).toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}

function ReviewDialog({
  placeId,
  naverPlaceId,
}: {
  placeId: string;
  naverPlaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isDirty) {
      setShowAlert(true);
      return;
    }
    if (!nextOpen) resetForm();
    setOpen(nextOpen);
  }

  function handleConfirmClose() {
    setShowAlert(false);
    resetForm();
    setOpen(false);
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const valid = files.filter((f) => f.size <= maxSize);

    if (valid.length < files.length) {
      alert("10MB를 초과하는 이미지는 제외되었습니다.");
    }

    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid]);
      setPreviews((prev) => [
        ...prev,
        ...valid.map((f) => URL.createObjectURL(f)),
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
              <MessageSquarePlus className="size-4" />
              리뷰 작성
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
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
                          ? "fill-primary text-primary"
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
                rows={3}
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <Label className="text-sm font-medium">사진</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="group relative">
                    <img
                      src={src}
                      alt={`미리보기 ${i + 1}`}
                      className="size-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-foreground p-0.5 text-background shadow-sm"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="size-6" />
                </button>
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
                리뷰 작성
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>리뷰 작성 취소</AlertDialogTitle>
            <AlertDialogDescription>
              작성 중인 내용이 사라집니다. 닫으시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 작성</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmClose}
            >
              닫기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
        <div className="space-y-3">
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
