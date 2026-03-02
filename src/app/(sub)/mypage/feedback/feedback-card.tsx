"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { FEEDBACK_CATEGORY_LABELS } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/date";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { FeedbackWithImages } from "@/types";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { deleteFeedback } from "./actions";
import { toast } from "sonner";

interface FeedbackCardProps {
  feedback: FeedbackWithImages;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const confirm = useConfirmDialog();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const sortedImages = feedback.feedback_images
    .slice()
    .sort((a, b) => a.display_order - b.display_order);
  const imageUrls = sortedImages.map((img) =>
    optimizeSupabaseImageUrl(img.url),
  );

  function handleEdit() {
    setDrawerOpen(false);
    router.push(`/mypage/feedback/${feedback.id}`);
  }

  async function handleDelete() {
    setDrawerOpen(false);
    const ok = await confirm({
      title: "피드백 삭제",
      description: "삭제된 피드백은 복구할 수 없습니다.\n정말 삭제하시겠습니까?",
      confirmLabel: "삭제",
      variant: "default",
    });
    if (!ok) return;

    startTransition(async () => {
      try {
        await deleteFeedback(feedback.id);
        queryClient.invalidateQueries({ queryKey: ["mypage", "feedbacks"] });
        toast.success("피드백이 삭제되었어요.", { position: "top-center" });
      } catch {
        toast.error("피드백 삭제에 실패했어요. 다시 시도해주세요.", {
          position: "top-center",
        });
      }
    });
  }

  return (
    <div
      className={cn("py-4 space-y-2 transition-opacity", {
        "opacity-50": isPending,
      })}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {FEEDBACK_CATEGORY_LABELS[feedback.category]}
          </Badge>
          {feedback.created_at && (
            <span className="text-xs text-muted-foreground/60">
              {formatRelativeDate(feedback.created_at)}
            </span>
          )}
        </div>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-0.5 -mr-1.5 size-7"
            >
              {isPending ? (
                <Spinner className="size-3.5" />
              ) : (
                <Ellipsis className="size-4" />
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="max-w-4xl mx-auto w-full p-4">
              <DrawerTitle className="sr-only">피드백 관리</DrawerTitle>
              <div className="flex flex-col py-2">
                <button
                  type="button"
                  className="flex items-center gap-3 py-4 text-base font-bold cursor-pointer"
                  onClick={handleEdit}
                >
                  <Pencil className="size-4" />
                  수정
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 py-4 text-base font-bold text-destructive cursor-pointer"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" />
                  삭제
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <p className="line-clamp-3 text-sm text-secondary-foreground">
        {feedback.content}
      </p>
      {sortedImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none md:grid md:grid-cols-5">
          {sortedImages.map((img, i) => (
            <button
              key={i}
              type="button"
              className="w-1/3 shrink-0 cursor-pointer overflow-hidden rounded-lg md:w-auto md:shrink"
              onClick={() => {
                setPreviewIndex(i);
                setPreviewOpen(true);
              }}
            >
              <img
                src={optimizeSupabaseImageUrl(img.url, { width: 200 })}
                alt={`피드백 이미지 ${i + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      {sortedImages.length > 0 && (
        <ImageCarouselDialog
          images={imageUrls}
          initialIndex={previewIndex}
          alt="피드백 이미지"
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  );
}
