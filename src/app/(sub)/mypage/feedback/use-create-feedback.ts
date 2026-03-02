import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { FeedbackCategory } from "@/types";
import { createFeedback } from "./actions";
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
      const imageUrls =
        files.length > 0
          ? await uploadFeedbackImages(files)
          : undefined;

      await createFeedback({ category, content }, imageUrls);
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
