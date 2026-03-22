import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { POINTS } from "@/lib/constants";
import { RankingList } from "./ranking-list";
import { RankingPoint } from "./ranking-point";

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const [
    { data: profile },
    { count: placeCount },
    { count: reviewCount },
    { data: reviewPhotos },
    { count: voteCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("total_points")
      .eq("id", user.id)
      .single(),
    supabase
      .from("places")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("reviews")
      .select("image_urls")
      .eq("user_id", user.id)
      .not("image_urls", "is", null),
    supabase
      .from("kona_card_votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const photoCount =
    reviewPhotos?.reduce(
      (sum, r) => sum + (r.image_urls?.length ?? 0),
      0,
    ) ?? 0;

  const stats = [
    { label: "장소 등록", count: placeCount ?? 0, pointPer: POINTS.PLACE_REGISTRATION },
    { label: "리뷰 작성", count: reviewCount ?? 0, pointPer: POINTS.REVIEW },
    { label: "리뷰 사진", count: photoCount, pointPer: POINTS.REVIEW_PHOTO },
    { label: "코나카드 투표", count: voteCount ?? 0, pointPer: POINTS.KONA_VOTE },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader title="랭킹" />
      <div className="flex flex-1 flex-col mx-auto w-full max-w-4xl">
        <RankingPoint
          totalPoints={profile?.total_points ?? 0}
          stats={stats}
        />
        <RankingList currentUserId={user.id} />
      </div>
    </div>
  );
}
