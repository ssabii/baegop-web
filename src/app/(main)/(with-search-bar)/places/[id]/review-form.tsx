"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { createPlaceWithReview } from "@/app/(main)/actions";
import type { NaverPlaceDetail } from "@/types";
import { toast } from "sonner";

export function ReviewForm({ placeDetail }: { placeDetail: NaverPlaceDetail }) {
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
      toast.warning("10MB를 초과하는 이미지는 제외되었습니다.", {
        position: "top-center",
      });
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

      await createPlaceWithReview(placeDetail, { rating, content }, formData);
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            리뷰 작성
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="text-left">
            <DialogTitle>리뷰 작성</DialogTitle>
            <DialogDescription>
              장소에 대한 리뷰를 작성해 주세요.
            </DialogDescription>
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
                    disabled={isPending}
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
              <Label htmlFor="content" className="text-sm font-medium">
                리뷰 내용
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2"
                rows={4}
                disabled={isPending}
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
                      disabled={isPending}
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-foreground p-0.5 text-background shadow-sm disabled:opacity-50"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
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
                disabled={isPending}
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

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>리뷰 작성 취소</AlertDialogTitle>
            <AlertDialogDescription>
              작성 중인 내용이 사라집니다. 닫으시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
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
