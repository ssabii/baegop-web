import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { FeedbackCategory } from "@/types";
import { updateFeedback } from "./actions";
import { uploadFeedbackImages } from "./upload-feedback-images";

export function useUpdateFeedback(feedbackId: number) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      content,
      keptImageUrls,
      files,
    }: {
      category: FeedbackCategory;
      content: string;
      keptImageUrls: string[];
      files: File[];
    }) => {
      const newImageUrls =
        files.length > 0
          ? await uploadFeedbackImages(feedbackId, files)
          : undefined;

      await updateFeedback(feedbackId, { category, content }, keptImageUrls, newImageUrls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage", "feedbacks"] });
      toast.success("피드백이 수정되었어요.", { position: "top-center" });
      router.back();
    },
    onError: () => {
      toast.error("피드백 수정에 실패했어요. 다시 시도해주세요.", {
        position: "top-center",
      });
    },
  });
}
