"use client";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquareText } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useMyFeedbacks } from "./use-my-feedbacks";
import { FeedbackCard } from "./feedback-card";

interface MyFeedbackListProps {
  userId: string;
}

export function MyFeedbackList({ userId }: MyFeedbackListProps) {
  const {
    feedbacks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMyFeedbacks(userId);

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

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty className="border-none">
          <EmptyHeader className="gap-1">
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-none bg-transparent"
            >
              <MessageSquareText className="size-12 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">
              작성한 피드백이 없어요
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 divide-y">
        {feedbacks.map((feedback) => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </>
  );
}
