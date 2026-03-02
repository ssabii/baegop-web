"use server";

import { createClient } from "@/lib/supabase/server";
import { toOriginalSupabaseImageUrl } from "@/lib/image";
import type { FeedbackCategory } from "@/types";

export async function createFeedback(data: {
  category: FeedbackCategory;
  content: string;
}): Promise<{ id: number }> {
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
      image_urls: null,
    })
    .select("id")
    .single();

  if (error || !feedback) throw new Error("피드백 작성에 실패했습니다");

  return { id: feedback.id };
}

export async function updateFeedbackImageUrls(
  feedbackId: number,
  imageUrls: string[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { error } = await supabase
    .from("feedbacks")
    .update({ image_urls: imageUrls })
    .eq("id", feedbackId)
    .eq("user_id", user.id);

  if (error) throw new Error("이미지 업데이트에 실패했습니다");
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

  // 기존 이미지 URL 조회
  const { data: existing } = await supabase
    .from("feedbacks")
    .select("image_urls")
    .eq("id", feedbackId)
    .eq("user_id", user.id)
    .single();

  // 삭제할 이미지 계산
  const keptOriginalUrls = new Set(keptImageUrls.map(toOriginalSupabaseImageUrl));
  const toDelete = (existing?.image_urls ?? []).filter(
    (url) => !keptOriginalUrls.has(url),
  );

  if (toDelete.length > 0) {
    const storagePaths = toDelete.map((url) => {
      const parts = url.split("/feedback-images/");
      return parts[1];
    });
    await supabase.storage.from("feedback-images").remove(storagePaths);
  }

  // 피드백 수정 (image_urls 포함)
  const finalImageUrls = [
    ...keptImageUrls.map(toOriginalSupabaseImageUrl),
    ...(newImageUrls ?? []),
  ];

  const { error } = await supabase
    .from("feedbacks")
    .update({
      category: data.category,
      content: data.content,
      image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
    })
    .eq("id", feedbackId)
    .eq("user_id", user.id);

  if (error) throw new Error("피드백 수정에 실패했습니다");
}

export async function deleteFeedback(feedbackId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // 이미지 URL 조회 → Storage 삭제
  const { data: feedback } = await supabase
    .from("feedbacks")
    .select("image_urls")
    .eq("id", feedbackId)
    .eq("user_id", user.id)
    .single();

  if (feedback && feedback.image_urls && feedback.image_urls.length > 0) {
    const storagePaths = feedback.image_urls.map((url) => {
      const parts = url.split("/feedback-images/");
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
