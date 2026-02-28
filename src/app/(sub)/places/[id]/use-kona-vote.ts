import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { voteKonaCard } from "./actions";
import type { KonaCardStatus, KonaVote } from "@/types";

interface UseKonaVoteOptions {
  placeId: string;
  initialStatus: KonaCardStatus;
  initialUserVote: KonaVote | null;
  onSuccess?: () => void;
}

export function useKonaVote({
  placeId,
  initialStatus,
  initialUserVote,
  onSuccess,
}: UseKonaVoteOptions) {
  const [status, setStatus] = useState<KonaCardStatus>(initialStatus);
  const [userVote, setUserVote] = useState<KonaVote | null>(initialUserVote);

  const mutation = useMutation({
    mutationFn: (vote: KonaVote) => voteKonaCard(placeId, vote),
    onMutate: (vote) => {
      const previousStatus = status;
      const previousUserVote = userVote;

      // 낙관적 업데이트: 같은 투표 클릭 시 취소, 다른 투표 클릭 시 변경
      const newUserVote = userVote === vote ? null : vote;
      setUserVote(newUserVote);

      return { previousStatus, previousUserVote };
    },
    onError: (_error, _vote, context) => {
      if (context) {
        setStatus(context.previousStatus);
        setUserVote(context.previousUserVote);
      }
    },
    onSuccess: (result) => {
      setStatus(result.status);
      setUserVote(result.userVote);
      onSuccess?.();
    },
  });

  return {
    status,
    userVote,
    vote: mutation.mutate,
    isPending: mutation.isPending,
    pendingVote: mutation.isPending ? mutation.variables : null,
  };
}
