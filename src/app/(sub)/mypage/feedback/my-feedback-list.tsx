"use client";

import { BottomActionBar } from "@/components/bottom-action-bar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Send } from "lucide-react";
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
              <Send className="size-12 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">
              작성한 피드백이 없어요
            </EmptyTitle>
            <EmptyDescription>배곱에게 피드백을 보내보세요!</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/mypage/feedback/new">피드백 작성</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 pb-23 divide-y">
        {feedbacks.map((feedback) => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
      <BottomActionBar>
        <Button size="xl" className="mx-auto w-full max-w-4xl" asChild>
          <Link href="/mypage/feedback/new">피드백 작성</Link>
        </Button>
      </BottomActionBar>
    </>
  );
}
