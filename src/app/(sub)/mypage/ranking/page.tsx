import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { RankingList } from "./ranking-list";
import { RankingPoint } from "@/app/(sub)/mypage/ranking/ranking-point";

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_points")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader title="랭킹" />
      <div className="flex flex-1 flex-col mx-auto w-full max-w-4xl">
        <RankingPoint totalPoints={profile?.total_points ?? 0} />
        <RankingList currentUserId={user.id} />
      </div>
    </div>
  );
}
