"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, Pencil, Star, Trash2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCarouselDialog } from "@/components/image-preview-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { formatRelativeDate } from "@/lib/date";
import { deleteReview } from "./actions";

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

function ReviewImages({
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirmDialog();

  function handleEdit() {
    router.push(`/places/${naverPlaceId}/review/${review.id}`);
  }

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
              <div className="flex gap-0.5 -mt-0.5 -mr-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleEdit}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Trash2 className="size-3.5" />
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
        <ReviewImages images={review.review_images} />
      )}
    </div>
  );
}

export function ReviewSection({
  naverPlaceId,
  reviews,
  currentUserId,
}: ReviewSectionProps) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <Empty className="py-12">
          <EmptyMedia>
            <MessageSquarePlus className="size-8" />
          </EmptyMedia>
          <EmptyTitle>아직 리뷰가 없습니다</EmptyTitle>
          <EmptyDescription>첫 번째 리뷰를 남겨보세요!</EmptyDescription>
        </Empty>
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
