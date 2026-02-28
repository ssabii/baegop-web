import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createReview } from "../actions";
import { uploadReviewImages } from "./upload-review-images";

export function useCreateReview(naverPlaceId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rating,
      content,
      files,
    }: {
      rating: number;
      content: string;
      files: File[];
    }) => {
      const imageUrls =
        files.length > 0
          ? await uploadReviewImages(naverPlaceId, files)
          : undefined;

      await createReview(naverPlaceId, { rating, content }, imageUrls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      sessionStorage.setItem("scrollToReview", "true");
      toast.success("리뷰가 등록되었어요.", { position: "top-center" });
      router.replace(`/places/${naverPlaceId}?tab=review`);
    },
    onError: () => {
      toast.error("리뷰 등록에 실패했어요. 다시 시도해주세요.", {
        position: "top-center",
      });
    },
  });
}
