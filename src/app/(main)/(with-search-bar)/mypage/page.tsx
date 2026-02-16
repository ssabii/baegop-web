import { redirect } from "next/navigation";
import { Star, UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceCard } from "@/components/place-card";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", user.id)
    .single();

  // 내가 작성한 리뷰 (맛집 이름 join)
  const { data: myReviews } = await supabase
    .from("reviews")
    .select("id, rating, content, created_at, places(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 내가 등록한 장소
  const { data: myPlaces } = await supabase
    .from("places")
    .select("id, naver_place_id, name, address, category, kona_card_status, image_urls")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const nickname = profile?.nickname ?? user.email ?? "사용자";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* 프로필 */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="size-16">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg">
              {nickname[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{nickname}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* 내가 작성한 리뷰 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Star className="size-5" />
          내가 작성한 리뷰 ({myReviews?.length ?? 0})
        </h2>
        {myReviews && myReviews.length > 0 ? (
          <div className="mt-4 space-y-3">
            {myReviews.map((review) => {
              const place = review.places as unknown as { id: number; name: string } | null;
              return (
                <Card key={review.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {place?.name ?? "알 수 없는 장소"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-3.5 ${
                            star <= review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {review.content && (
                      <p className="text-sm text-muted-foreground">
                        {review.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      {review.created_at && new Date(review.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 작성한 리뷰가 없습니다.
          </p>
        )}
      </section>

      {/* 내가 등록한 장소 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UtensilsCrossed className="size-5" />
          내가 등록한 장소 ({myPlaces?.length ?? 0})
        </h2>
        {myPlaces && myPlaces.length > 0 ? (
          <div className="mt-4">
            {myPlaces.map((r) => (
              <PlaceCard key={r.id} place={r} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 등록한 장소가 없습니다.
          </p>
        )}
      </section>
    </main>
  );
}
