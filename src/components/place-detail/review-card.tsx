"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Ellipsis, Pencil, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteReview } from "@/app/(sub)/places/[id]/actions";
import { ReviewImages } from "@/app/(sub)/places/[id]/review-images";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { formatRelativeDate } from "@/lib/date";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { reviewKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { StarRating } from "./star-rating";

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    content: string | null;
    created_at: string | null;
    user_id: string | null;
    image_urls: string[] | null;
    profiles: {
      nickname: string | null;
      avatar_url: string | null;
    } | null;
  };
  isOwner: boolean;
  naverPlaceId: string;
}

export function ReviewCard({ review, isOwner, naverPlaceId }: ReviewCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const confirm = useConfirmDialog();

  function handleEdit() {
    setDrawerOpen(false);
    router.push(`/places/${naverPlaceId}/review/${review.id}`);
  }

  async function handleDelete() {
    setDrawerOpen(false);
    const ok = await confirm({
      title: "리뷰 삭제",
      description: "삭제된 리뷰는 복구할 수 없습니다.\n정말 삭제하시겠습니까?",
      confirmLabel: "삭제",
      variant: "default",
    });
    if (!ok) return;

    startTransition(async () => {
      try {
        await deleteReview(review.id);
        void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
        router.refresh();
        toast.success("리뷰가 삭제되었어요.", { position: "top-center" });
      } catch {
        toast.error("리뷰 삭제에 실패했어요. 다시 시도해주세요.", {
          position: "top-center",
        });
      }
    });
  }

  const nickname = review.profiles?.nickname ?? "탈퇴한 사용자";

  return (
    <div
      className={cn("space-y-2 py-4 transition-opacity", {
        "opacity-50": isPending,
      })}
    >
      <div className="flex items-start gap-2">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={
              review.profiles?.avatar_url
                ? optimizeSupabaseImageUrl(review.profiles.avatar_url)
                : undefined
            }
          />
          <AvatarFallback>
            <UserRound className="text-muted-foreground size-10" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{nickname}</span>
            {isOwner && (
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
                  <div className="mx-auto w-full max-w-4xl p-4">
                    <DrawerTitle className="sr-only">리뷰 관리</DrawerTitle>
                    <div className="flex flex-col py-2">
                      <button
                        type="button"
                        className="flex cursor-pointer items-center gap-3 py-4 text-base font-bold"
                        onClick={handleEdit}
                      >
                        <Pencil className="size-4" />
                        수정
                      </button>
                      <button
                        type="button"
                        className="text-destructive flex cursor-pointer items-center gap-3 py-4 text-base font-bold"
                        onClick={handleDelete}
                      >
                        <Trash2 className="size-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StarRating rating={review.rating} />
            {review.created_at && (
              <span className="text-muted-foreground/60 text-xs">
                {formatRelativeDate(review.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>
      {review.content && (
        <p className="text-secondary-foreground text-sm">{review.content}</p>
      )}
      {(review.image_urls?.length ?? 0) > 0 && (
        <ReviewImages images={review.image_urls!} />
      )}
    </div>
  );
}
