import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { MyFeedbackList } from "./my-feedback-list";

export default async function MyFeedbacksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader title="피드백" />
      <div className="flex flex-1 flex-col mx-auto w-full max-w-4xl">
        <MyFeedbackList userId={user.id} />
      </div>
    </div>
  );
}
