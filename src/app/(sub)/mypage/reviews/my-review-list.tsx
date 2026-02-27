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
import { Fragment } from "react/jsx-runtime";
import { Separator } from "@/components/ui/separator";

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
              <MessageCircle className="size-12 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">작성한 리뷰가 없어요</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-8">
        {reviews.map((review, index) => {
          const place = review.places
            ? { id: String(review.places.id), name: review.places.name }
            : null;

          return (
            <Fragment key={review.id}>
              {index > 0 && <Separator className="my-4" />}
              <ReviewCard
                review={{ ...review, place }}
                onClick={() =>
                  sessionStorage.setItem("scrollToReview", "true")
                }
              />
            </Fragment>
          );
        })}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </>
  );
}
