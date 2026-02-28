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
import { useReviews, type ReviewsResponse } from "./use-reviews";

interface ReviewSectionProps {
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
  isRegistered: boolean;
  initialData: ReviewsResponse;
}

export function ReviewSection({
  placeId,
  naverPlaceId,
  currentUserId,
  isRegistered,
  initialData,
}: ReviewSectionProps) {
  if (!isRegistered || !placeId) {
    return <ReviewEmpty />;
  }

  return (
    <ReviewSectionContent
      placeId={placeId}
      naverPlaceId={naverPlaceId}
      currentUserId={currentUserId}
      initialData={initialData}
    />
  );
}

function ReviewEmpty() {
  return (
    <Empty className="h-[40vh]">
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

function ReviewSectionContent({
  placeId,
  naverPlaceId,
  currentUserId,
  initialData,
}: {
  placeId: string;
  naverPlaceId: string;
  currentUserId: string | null;
  initialData: ReviewsResponse;
}) {
  const { reviews, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useReviews(placeId, initialData);

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return <ReviewEmpty />;
  }

  return (
    <div className="min-h-[40vh]">
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
      <div ref={sentinelRef} className="flex items-center justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </div>
  );
}
