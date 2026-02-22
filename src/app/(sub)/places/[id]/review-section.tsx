"use client";

import { useInView } from "react-intersection-observer";
import { MessageCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReviewCard } from "./review-card";
import { useReviews } from "./use-reviews";

interface ReviewSectionProps {
  placeId: string;
  naverPlaceId: string;
  currentUserId: string | null;
}

export function ReviewSection({
  placeId,
  naverPlaceId,
  currentUserId,
}: ReviewSectionProps) {
  const { reviews, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useReviews(placeId);

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Empty className="h-[calc(100dvh*0.5)]">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <MessageCircle className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">작성된 리뷰가 없어요</EmptyTitle>
          <EmptyDescription>첫 번째 리뷰를 작성해보세요!</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-h-[calc(100dvh*0.5)]">
      <div className="divide-y">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={!!currentUserId && currentUserId === review.user_id}
            naverPlaceId={naverPlaceId}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </div>
  );
}
