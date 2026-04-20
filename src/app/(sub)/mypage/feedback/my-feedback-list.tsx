"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
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
import { FeedbackCard } from "./feedback-card";
import { useMyFeedbacks } from "./use-my-feedbacks";

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
        <Spinner className="text-primary size-8" />
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
              <Send className="text-primary size-12" />
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
      <div className="divide-y p-4 pb-23">
        {feedbacks.map((feedback) => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
        ))}
      </div>
      <div ref={sentinelRef} className="flex justify-center">
        {isFetchingNextPage && <Spinner className="text-primary size-6" />}
      </div>
      <BottomActionBar>
        <div className="mx-auto flex max-w-4xl">
          <Button size="xl" className="w-full" asChild>
            <Link href="/mypage/feedback/new">피드백 작성</Link>
          </Button>
        </div>
      </BottomActionBar>
    </>
  );
}
