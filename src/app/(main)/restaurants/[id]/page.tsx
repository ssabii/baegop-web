import { notFound } from "next/navigation";
import {
  ExternalLink,
  MapPin,
  Phone,
  Tag,
  MessageSquare,
  UtensilsCrossed,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewSection } from "./review-section";
import { ReactionButtons } from "./reaction-buttons";
import { KonaVoteSection } from "./kona-vote";
import type { KonaCardStatus, ReactionType, KonaVote } from "@/types";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!restaurant) notFound();

  // 리뷰 목록
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(nickname, avatar_url)")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  // 현재 유저
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 좋아요/싫어요 카운트
  const { count: likeCount } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .eq("type", "like");

  const { count: dislikeCount } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .eq("type", "dislike");

  // 현재 유저의 reaction
  let userReaction: ReactionType | null = null;
  if (user) {
    const { data: reaction } = await supabase
      .from("reactions")
      .select("type")
      .eq("restaurant_id", restaurant.id)
      .eq("user_id", user.id)
      .single();
    userReaction = (reaction?.type as ReactionType) ?? null;
  }

  // 현재 유저의 코나카드 투표
  let userKonaVote: KonaVote | null = null;
  if (user) {
    const { data: vote } = await supabase
      .from("kona_card_votes")
      .select("vote")
      .eq("restaurant_id", restaurant.id)
      .eq("user_id", user.id)
      .single();
    userKonaVote = (vote?.vote as KonaVote) ?? null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        {restaurant.image_urls?.[0] ? (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={restaurant.image_urls[0]}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-muted">
            <UtensilsCrossed className="size-12 text-muted-foreground" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {restaurant.address}
          </p>
          {restaurant.category && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="size-4 shrink-0" />
              {restaurant.category}
            </p>
          )}
          {restaurant.telephone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <a
                href={`tel:${restaurant.telephone}`}
                className="hover:underline"
              >
                {restaurant.telephone}
              </a>
            </p>
          )}
          {restaurant.naver_link && (
            <a
              href={restaurant.naver_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-4" />
              네이버에서 보기
            </a>
          )}

          {/* 좋아요/싫어요 */}
          <div className="pt-2">
            <ReactionButtons
              restaurantId={restaurant.id}
              likeCount={likeCount ?? 0}
              dislikeCount={dislikeCount ?? 0}
              userReaction={userReaction}
              isLoggedIn={!!user}
            />
          </div>

          {/* 코나카드 투표 */}
          <div className="pt-1">
            <KonaVoteSection
              restaurantId={restaurant.id}
              status={(restaurant.kona_card_status as KonaCardStatus) ?? "unknown"}
              userVote={userKonaVote}
              isLoggedIn={!!user}
            />
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 섹션 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="size-5" />
          리뷰 ({reviews?.length ?? 0})
        </h2>
        <div className="mt-4">
          <ReviewSection
            restaurantId={restaurant.id}
            reviews={(reviews as never[]) ?? []}
            currentUserId={user?.id ?? null}
          />
        </div>
      </section>
    </main>
  );
}
