import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { voteKonaCard } from "@/app/(sub)/places/[id]/actions";
import {
  mapKeys,
  mypageKeys,
  placeKeys,
  rankingKeys,
} from "@/lib/query-keys";
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
  const queryClient = useQueryClient();
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
      // 임계값 도달 시 kona_card_status가 변경될 수 있어 관련 목록/상세를 무효화한다
      queryClient.invalidateQueries({ queryKey: placeKeys.data(placeId) });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
      queryClient.invalidateQueries({ queryKey: mapKeys.places });
      queryClient.invalidateQueries({ queryKey: mypageKeys.places });
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
