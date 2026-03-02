"use server";

import { createClient } from "@/lib/supabase/server";
import { toOriginalSupabaseImageUrl } from "@/lib/image";
import type { FeedbackCategory } from "@/types";

export async function createFeedback(
  data: { category: FeedbackCategory; content: string },
  imageUrls?: string[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { data: feedback, error } = await supabase
    .from("feedbacks")
    .insert({
      user_id: user.id,
      category: data.category,
      content: data.content,
    })
    .select("id")
    .single();

  if (error || !feedback) throw new Error("피드백 작성에 실패했습니다");

  if (imageUrls && imageUrls.length > 0) {
    await supabase.from("feedback_images").insert(
      imageUrls.map((url, i) => ({
        feedback_id: feedback.id,
        url,
        display_order: i,
      })),
    );
  }
}

export async function updateFeedback(
  feedbackId: number,
  data: { category: FeedbackCategory; content: string },
  keptImageUrls: string[],
  newImageUrls?: string[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const [updateResult, existingResult] = await Promise.all([
    supabase
      .from("feedbacks")
      .update({ category: data.category, content: data.content })
      .eq("id", feedbackId)
      .eq("user_id", user.id),
    supabase
      .from("feedback_images")
      .select("url")
      .eq("feedback_id", feedbackId),
  ]);

  if (updateResult.error) throw new Error("피드백 수정에 실패했습니다");

  const keptOriginalUrls = new Set(keptImageUrls.map(toOriginalSupabaseImageUrl));
  const toDelete = (existingResult.data ?? [])
    .map((row) => row.url as string)
    .filter((url) => !keptOriginalUrls.has(url));

  if (toDelete.length > 0) {
    const storagePaths = toDelete.map((url) => {
      const parts = url.split("/feedback-images/");
      return parts[1];
    });

    await Promise.all([
      supabase.storage.from("feedback-images").remove(storagePaths),
      supabase
        .from("feedback_images")
        .delete()
        .eq("feedback_id", feedbackId)
        .in("url", toDelete),
    ]);
  }

  if (newImageUrls && newImageUrls.length > 0) {
    const nextOrder = keptImageUrls.length;
    await supabase.from("feedback_images").insert(
      newImageUrls.map((url, i) => ({
        feedback_id: feedbackId,
        url,
        display_order: nextOrder + i,
      })),
    );
  }
}

export async function deleteFeedback(feedbackId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // 이미지 URL 조회 → Storage 삭제
  const { data: images } = await supabase
    .from("feedback_images")
    .select("url")
    .eq("feedback_id", feedbackId);

  if (images && images.length > 0) {
    const storagePaths = images.map((img) => {
      const parts = (img.url as string).split("/feedback-images/");
      return parts[1];
    });
    await supabase.storage.from("feedback-images").remove(storagePaths);
  }

  const { error } = await supabase
    .from("feedbacks")
    .delete()
    .eq("id", feedbackId)
    .eq("user_id", user.id);

  if (error) throw new Error("피드백 삭제에 실패했습니다");
}
