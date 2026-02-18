"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { voteKonaCard } from "./actions";
import type { KonaCardStatus, KonaVote } from "@/types";

interface KonaVoteProps {
  placeId: string;
  naverPlaceId: string;
  status: KonaCardStatus;
  userVote: KonaVote | null;
  isLoggedIn: boolean;
}

export function KonaVoteSection({
  placeId,
  naverPlaceId,
  status,
  userVote,
  isLoggedIn,
}: KonaVoteProps) {
  const [isPending, startTransition] = useTransition();
  const [clickedVote, setClickedVote] = useState<KonaVote | null>(null);

  function handleVote(vote: KonaVote) {
    setClickedVote(vote);
    startTransition(async () => {
      await voteKonaCard(placeId, naverPlaceId, vote);
      // setClickedVote(null);
    });
  }

  return (
    <div className="w-full flex flex-wrap items-center gap-3">
      {status !== "unknown" && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            status === "available"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <img src="/icons/kona.png" alt="코나카드" className="size-4" />
          {status === "available" ? "결제가능" : "결제불가"}
        </span>
      )}

      {isLoggedIn && (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="/icons/kona.png" alt="코나카드" className="size-4" />
            <span className="text-sm font-medium text-muted-foreground">
              코나카드 결제가 가능한가요?
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant={userVote === "available" ? "default" : "outline"}
              size="xs"
              onClick={() => handleVote("available")}
              disabled={isPending}
            >
              {isPending && clickedVote === "available" ? (
                <Spinner className="size-3" data-icon="inline-start" />
              ) : (
                "가능"
              )}
            </Button>
            <Button
              variant={userVote === "unavailable" ? "default" : "outline"}
              size="xs"
              onClick={() => handleVote("unavailable")}
              disabled={isPending}
            >
              {isPending && clickedVote === "unavailable" ? (
                <Spinner className="size-3" data-icon="inline-start" />
              ) : (
                "불가"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
