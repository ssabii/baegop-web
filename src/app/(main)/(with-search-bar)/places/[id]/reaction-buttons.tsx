"use client";

import { useTransition } from "react";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleReaction } from "./actions";
import type { ReactionType } from "@/types";

interface ReactionButtonsProps {
  placeId: number;
  likeCount: number;
  dislikeCount: number;
  userReaction: ReactionType | null;
  isLoggedIn: boolean;
}

export function ReactionButtons({
  placeId,
  likeCount,
  dislikeCount,
  userReaction,
  isLoggedIn,
}: ReactionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick(type: ReactionType) {
    startTransition(async () => {
      await toggleReaction(placeId, type);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userReaction === "like" ? "default" : "outline"}
        size="sm"
        className="gap-1.5"
        onClick={() => handleClick("like")}
        disabled={!isLoggedIn || isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ThumbsUp className="size-4" />
        )}
        {likeCount}
      </Button>
      <Button
        variant={userReaction === "dislike" ? "default" : "outline"}
        size="sm"
        className="gap-1.5"
        onClick={() => handleClick("dislike")}
        disabled={!isLoggedIn || isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ThumbsDown className="size-4" />
        )}
        {dislikeCount}
      </Button>
    </div>
  );
}
