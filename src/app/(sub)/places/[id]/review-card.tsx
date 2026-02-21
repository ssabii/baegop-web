"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { formatRelativeDate } from "@/lib/date";
import { StarRating } from "./star-rating";
import { ReviewImages } from "./review-images";
import { deleteReview } from "./actions";

interface ReviewCardProps {
  review: {
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
  };
  isOwner: boolean;
  naverPlaceId: string;
}

export function ReviewCard({ review, isOwner, naverPlaceId }: ReviewCardProps) {
  const router = useRouter();
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
                  <DrawerTitle className="sr-only">리뷰 관리</DrawerTitle>
                  <div className="mx-auto flex w-full max-w-4xl flex-col py-2">
                    <button
                      type="button"
                      className="flex items-center gap-3 px-4 py-2 text-base font-bold cursor-pointer"
                      onClick={handleEdit}
                    >
                      <Pencil className="size-4" />
                      수정
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-3 px-4 py-2 text-base font-bold cursor-pointer"
                      onClick={handleDelete}
                    >
                      <Trash2 className="size-4" />
                      삭제
                    </button>
                  </div>
                </DrawerContent>
              </Drawer>
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
        <p className="text-sm text-secondary-foreground">{review.content}</p>
      )}
      {review.review_images.length > 0 && (
        <ReviewImages images={review.review_images} />
      )}
    </div>
  );
}
