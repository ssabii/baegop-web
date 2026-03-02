import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateReview } from "../actions";
import { uploadReviewImages } from "./upload-review-images";

export function useUpdateReview(naverPlaceId: string, reviewId: number) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rating,
      content,
      keptImageUrls,
      files,
    }: {
      rating: number;
      content: string;
      keptImageUrls: string[];
      files: File[];
    }) => {
      const newImageUrls =
        files.length > 0
          ? await uploadReviewImages(naverPlaceId, files)
          : undefined;

      await updateReview(reviewId, { rating, content }, keptImageUrls, newImageUrls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      sessionStorage.setItem("scrollToReview", "true");
      toast.success("리뷰가 수정되었어요.", { position: "top-center" });
      router.replace(`/places/${naverPlaceId}?tab=review`);
    },
    onError: () => {
      toast.error("리뷰 수정에 실패했어요. 다시 시도해주세요.", {
        position: "top-center",
      });
    },
  });
}
