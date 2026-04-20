"use client";

import { MessageCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { ReviewCard } from "@/components/reviews";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useMyReviews } from "./use-my-reviews";

interface MyReviewListProps {
  userId: string;
}

export function MyReviewList({ userId }: MyReviewListProps) {
  const { reviews, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMyReviews(userId);

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="text-primary size-8" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty className="border-none">
          <EmptyHeader className="gap-1">
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-none bg-transparent"
            >
              <MessageCircle className="text-primary size-12" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">작성한 리뷰가 없어요</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y p-4">
        {reviews.map((review) => {
          const place = review.places
            ? { id: String(review.places.id), name: review.places.name }
            : null;

          return (
            <ReviewCard
              key={review.id}
              review={{ ...review, place }}
              className="py-4"
              onClick={() => sessionStorage.setItem("scrollToReview", "true")}
            />
          );
        })}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="text-primary size-6" />}
      </div>
    </>
  );
}
