import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { MyReviewList } from "./my-review-list";

export default async function MyReviewsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="bg-muted flex min-h-dvh flex-col">
      <SubHeader title="내 리뷰" />
      <div className="flex flex-1 flex-col">
        <MyReviewList userId={user.id} />
      </div>
    </div>
  );
}
