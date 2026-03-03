"use client";

import { useInView } from "react-intersection-observer";
import { Trophy } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useRanking } from "@/hooks/use-ranking";
import { RankingCard } from "./ranking-card";

interface RankingListProps {
  currentUserId: string;
}

export function RankingList({ currentUserId }: RankingListProps) {
  const { users, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useRanking();

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

  if (users.length === 0) {
    return (
      <Empty className="flex-1 border-none">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <Trophy className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">아직 랭킹이 없어요</EmptyTitle>
          <EmptyDescription>
            장소를 등록하거나 리뷰를 작성해보세요
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col py-2">
      <div className="divide-y">
        {users.map((user, index) => (
          <RankingCard
            key={user.id}
            user={user}
            rank={index + 1}
            isCurrentUser={user.id === currentUserId}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="flex items-center justify-center py-4">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </div>
  );
}
