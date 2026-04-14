import { redirect } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { POINTS } from "@/lib/constants";
import { fetchRanking } from "@/lib/queries/ranking";
import { rankingKeys } from "@/lib/query-keys";
import { RankingList } from "./ranking-list";
import { PointSection } from "./point-section";

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const queryClient = new QueryClient();

  const totalPointQuery = supabase
    .from("profiles")
    .select("total_points")
    .eq("id", user.id)
    .single();

  const placeCountQuery = supabase
    .from("places")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user.id);

  const reviewCountQuery = supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const reviewPhotoQuery = supabase
    .from("reviews")
    .select("image_urls")
    .eq("user_id", user.id)
    .not("image_urls", "is", null);

  const voteCountQuery = supabase
    .from("kona_card_votes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const rankingPrefetch = queryClient.prefetchInfiniteQuery({
    queryKey: rankingKeys.all,
    queryFn: () => fetchRanking(),
    initialPageParam: 0,
  });

  const [
    { data: profile },
    { count: placeCount },
    { count: reviewCount },
    { data: reviewPhotos },
    { count: voteCount },
  ] = await Promise.all([
    totalPointQuery,
    placeCountQuery,
    reviewCountQuery,
    reviewPhotoQuery,
    voteCountQuery,
    rankingPrefetch,
  ]);

  const photoCount =
    reviewPhotos?.reduce((sum, r) => sum + (r.image_urls?.length ?? 0), 0) ?? 0;

  const stats = [
    {
      label: "장소 등록",
      count: placeCount ?? 0,
      pointPer: POINTS.PLACE_REGISTRATION,
    },
    { label: "리뷰 작성", count: reviewCount ?? 0, pointPer: POINTS.REVIEW },
    { label: "리뷰 사진", count: photoCount, pointPer: POINTS.REVIEW_PHOTO },
    {
      label: "코나카드 투표",
      count: voteCount ?? 0,
      pointPer: POINTS.KONA_VOTE,
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader title="랭킹" />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <PointSection totalPoints={profile?.total_points ?? 0} stats={stats} />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <RankingList currentUserId={user.id} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
