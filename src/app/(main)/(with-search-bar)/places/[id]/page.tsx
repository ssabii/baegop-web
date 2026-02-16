import { notFound } from "next/navigation";
import {
  ExternalLink,
  MapPin,
  Phone,
  Tag,
  MessageSquare,
  UtensilsCrossed,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGallery } from "@/components/image-gallery";
import { ReviewSection } from "./review-section";
import { ReactionButtons } from "./reaction-buttons";
import { KonaVoteSection } from "./kona-vote";
import type { KonaCardStatus, ReactionType, KonaVote } from "@/types";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: place } = await supabase
    .from("places")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!place) notFound();

  // 리뷰 목록
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(nickname, avatar_url)")
    .eq("place_id", place.id)
    .order("created_at", { ascending: false });

  // 메뉴 목록
  const { data: menus } = await supabase
    .from("place_menus")
    .select("*")
    .eq("place_id", place.id)
    .order("priority", { ascending: true });

  // 현재 유저
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 좋아요/싫어요 카운트
  const { count: likeCount } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .eq("place_id", place.id)
    .eq("type", "like");

  const { count: dislikeCount } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .eq("place_id", place.id)
    .eq("type", "dislike");

  // 현재 유저의 reaction
  let userReaction: ReactionType | null = null;
  if (user) {
    const { data: reaction } = await supabase
      .from("reactions")
      .select("type")
      .eq("place_id", place.id)
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
      .eq("place_id", place.id)
      .eq("user_id", user.id)
      .single();
    userKonaVote = (vote?.vote as KonaVote) ?? null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <ImageGallery images={place.image_urls ?? []} alt={place.name} />
        <CardHeader>
          <CardTitle className="text-2xl">{place.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {place.address}
          </p>
          {place.category && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="size-4 shrink-0" />
              {place.category}
            </p>
          )}
          {place.telephone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <a
                href={`tel:${place.telephone}`}
                className="hover:underline"
              >
                {place.telephone}
              </a>
            </p>
          )}
          {place.naver_link && (
            <a
              href={place.naver_link}
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
              placeId={place.id}
              likeCount={likeCount ?? 0}
              dislikeCount={dislikeCount ?? 0}
              userReaction={userReaction}
              isLoggedIn={!!user}
            />
          </div>

          {/* 코나카드 투표 */}
          <div className="pt-1">
            <KonaVoteSection
              placeId={place.id}
              status={(place.kona_card_status as KonaCardStatus) ?? "unknown"}
              userVote={userKonaVote}
              isLoggedIn={!!user}
            />
          </div>
        </CardContent>
      </Card>

      {/* 메뉴 섹션 */}
      {menus && menus.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <UtensilsCrossed className="size-5" />
            메뉴 ({menus.length})
          </h2>
          <ul className="mt-4 divide-y rounded-lg border">
            {menus.map((menu) => (
              <li
                key={menu.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{menu.name}</span>
                  {menu.recommend && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      <Flame className="size-3" />
                      인기
                    </span>
                  )}
                </div>
                {menu.price && (
                  <span className="text-sm text-muted-foreground">
                    {menu.price}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 리뷰 섹션 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="size-5" />
          리뷰 ({reviews?.length ?? 0})
        </h2>
        <div className="mt-4">
          <ReviewSection
            placeId={place.id}
            reviews={(reviews as never[]) ?? []}
            currentUserId={user?.id ?? null}
          />
        </div>
      </section>
    </main>
  );
}
