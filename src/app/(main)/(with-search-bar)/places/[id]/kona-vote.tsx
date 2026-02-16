"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { voteKonaCard } from "./actions";
import type { KonaCardStatus, KonaVote } from "@/types";

interface KonaVoteProps {
  placeId: number;
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

  function handleVote(vote: KonaVote) {
    startTransition(async () => {
      await voteKonaCard(placeId, naverPlaceId, vote);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status !== "unknown" && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            status === "available"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <img
            src="/icons/kona.png"
            alt="코나카드"
            className="size-3.5 rounded-sm"
          />
          {status === "available" ? "결제가능" : "결제불가"}
        </span>
      )}

      {isLoggedIn && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">코나카드:</span>
          <Button
            variant={userVote === "available" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleVote("available")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : "가능"}
          </Button>
          <Button
            variant={userVote === "unavailable" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleVote("unavailable")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : "불가"}
          </Button>
        </div>
      )}
    </div>
  );
}
