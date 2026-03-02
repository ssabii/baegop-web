import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedbackFormPage } from "../feedback-form-page";
import type { FeedbackCategory, FeedbackWithImages } from "@/types";

export default async function FeedbackEditPage({
  params,
}: {
  params: Promise<{ feedbackId: string }>;
}) {
  const { feedbackId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const searchParams = new URLSearchParams({
      redirect: `/mypage/feedback/${feedbackId}`,
    });
    redirect(`/signin?${searchParams}`);
  }

  const { data: feedback } = await supabase
    .from("feedbacks")
    .select("id, category, content, created_at, user_id, feedback_images(url, display_order)")
    .eq("id", Number(feedbackId))
    .single();

  if (!feedback || feedback.user_id !== user.id) notFound();

  const feedbackData: FeedbackWithImages = {
    id: feedback.id,
    category: feedback.category as FeedbackCategory,
    content: feedback.content,
    created_at: feedback.created_at,
    feedback_images: feedback.feedback_images,
  };

  return <FeedbackFormPage mode="edit" feedback={feedbackData} />;
}
