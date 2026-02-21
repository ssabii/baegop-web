"use client";

import { useInView } from "react-intersection-observer";
import { MessageCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReviewCard } from "@/components/reviews";
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
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-8 text-primary" />
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
              <MessageCircle className="size-12" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">
              작성한 리뷰가 없어요
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-8">
        {reviews.map((review) => {
          const place = review.places
            ? { id: String(review.places.id), name: review.places.name }
            : null;
          return (
            <ReviewCard
              key={review.id}
              review={{ ...review, place }}
            />
          );
        })}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </>
  );
}
