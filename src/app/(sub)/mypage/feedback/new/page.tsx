import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedbackFormPage } from "../feedback-form-page";

export default async function FeedbackNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const params = new URLSearchParams({ redirect: "/mypage/feedback/new" });
    redirect(`/signin?${params}`);
  }

  return <FeedbackFormPage mode="create" />;
}
