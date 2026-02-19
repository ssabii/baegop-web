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

const STATUS_CONFIG: Record<
  KonaCardStatus,
  { label: string; className: string }
> = {
  available: {
    label: "결제 가능",
    className: "text-purple-700 dark:text-purple-300",
  },
  unavailable: {
    label: "결제 불가",
    className: "text-muted-foreground",
  },
  unknown: {
    label: "미확인",
    className: "text-muted-foreground",
  },
};

export function KonaVoteSection({
  placeId,
  naverPlaceId,
  status: initialStatus,
  userVote: initialUserVote,
  isLoggedIn,
}: KonaVoteProps) {
  const [isPending, startTransition] = useTransition();
  const [clickedVote, setClickedVote] = useState<KonaVote | null>(null);
  const [status, setStatus] = useState<KonaCardStatus>(initialStatus);
  const [userVote, setUserVote] = useState<KonaVote | null>(initialUserVote);

  function handleVote(vote: KonaVote) {
    setClickedVote(vote);
    startTransition(async () => {
      const result = await voteKonaCard(placeId, naverPlaceId, vote);
      setStatus(result.status);
      setUserVote(result.userVote);
    });
  }

  const config = STATUS_CONFIG[status];

  return (
    <section className="rounded-xl bg-muted p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/kona.png" alt="코나카드" className="size-5" />
          <span className="text-sm font-bold">코나카드</span>
        </div>
        <span className={`text-sm font-semibold ${config.className}`}>
          {config.label}
        </span>
      </div>

      {isLoggedIn && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            코나카드 결제가 가능한가요?
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant={userVote === "available" ? "default" : "outline"}
              size="xs"
              onClick={() => handleVote("available")}
              disabled={isPending}
            >
              {isPending && clickedVote === "available" && (
                <Spinner className="size-3" data-icon="inline-start" />
              )}
              가능
            </Button>
            <Button
              variant={userVote === "unavailable" ? "default" : "outline"}
              size="xs"
              onClick={() => handleVote("unavailable")}
              disabled={isPending}
            >
              {isPending && clickedVote === "unavailable" && (
                <Spinner className="size-3" data-icon="inline-start" />
              )}
              불가
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
