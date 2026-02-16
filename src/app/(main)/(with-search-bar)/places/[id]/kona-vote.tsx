"use client";

import { useTransition } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { voteKonaCard } from "./actions";
import { KONA_CARD_LABELS } from "@/lib/constants";
import type { KonaCardStatus, KonaVote } from "@/types";

interface KonaVoteProps {
  placeId: number;
  status: KonaCardStatus;
  userVote: KonaVote | null;
  isLoggedIn: boolean;
}

const STATUS_VARIANT: Record<KonaCardStatus, "default" | "destructive" | "secondary"> = {
  available: "default",
  unavailable: "destructive",
  unknown: "secondary",
};

export function KonaVoteSection({
  placeId,
  status,
  userVote,
  isLoggedIn,
}: KonaVoteProps) {
  const [isPending, startTransition] = useTransition();

  function handleVote(vote: KonaVote) {
    startTransition(async () => {
      await voteKonaCard(placeId, vote);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <CreditCard className="size-4 text-muted-foreground" />
        <Badge variant={STATUS_VARIANT[status]}>
          {KONA_CARD_LABELS[status]}
        </Badge>
      </div>

      {isLoggedIn && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">투표:</span>
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
