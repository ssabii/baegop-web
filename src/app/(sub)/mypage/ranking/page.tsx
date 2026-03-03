import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { RankingList } from "@/components/ranking/ranking-list";

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader title="랭킹" />
      <div className="flex flex-1 flex-col mx-auto w-full max-w-4xl">
        <RankingList currentUserId={user.id} />
      </div>
    </div>
  );
}
