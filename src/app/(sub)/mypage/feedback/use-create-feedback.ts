import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { FeedbackCategory } from "@/types";
import { createFeedback, updateFeedbackImageUrls } from "./actions";
import { uploadFeedbackImages } from "./upload-feedback-images";

export function useCreateFeedback() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      content,
      files,
    }: {
      category: FeedbackCategory;
      content: string;
      files: File[];
    }) => {
      const { id: feedbackId } = await createFeedback({ category, content });

      if (files.length > 0) {
        const imageUrls = await uploadFeedbackImages(feedbackId, files);
        await updateFeedbackImageUrls(feedbackId, imageUrls);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mypage", "feedbacks"] });
      toast.success("피드백이 등록되었어요.", { position: "top-center" });
      router.back();
    },
    onError: () => {
      toast.error("피드백 등록에 실패했어요. 다시 시도해주세요.", {
        position: "top-center",
      });
    },
  });
}
