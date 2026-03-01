import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFavorite } from "@/app/(sub)/places/[id]/actions";
import { toast } from "sonner";
import { favoritesQueryKey } from "./use-favorites";

export function useFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (placeId) => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });

      const previous =
        queryClient.getQueryData<string[]>(favoritesQueryKey) ?? [];
      const isFavorited = previous.includes(placeId);

      queryClient.setQueryData<string[]>(favoritesQueryKey, (old = []) =>
        isFavorited ? old.filter((id) => id !== placeId) : [...old, placeId],
      );

      return { previous };
    },
    onSuccess: (result) => {
      if (result.isFavorited) {
        toast.success("내 장소에 추가되었어요");
      } else {
        toast.success("내 장소에서 삭제되었어요");
      }
    },
    onError: (_error, _placeId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoritesQueryKey, context.previous);
      }
      toast.error("오류가 발생했어요");
    },
  });
}
