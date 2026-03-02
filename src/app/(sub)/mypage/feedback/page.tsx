import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { MyFeedbackList } from "./my-feedback-list";

export default async function MyFeedbacksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader
        title="피드백"
        rightElement={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mypage/feedback/new">
              <Send className="size-4" />
              피드백 작성
            </Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col mx-auto w-full max-w-4xl">
        <MyFeedbackList userId={user.id} />
      </div>
    </div>
  );
}
