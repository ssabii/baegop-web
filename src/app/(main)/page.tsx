import Link from "next/link";
import { Search, Shuffle, ThumbsUp, Clock, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { RestaurantCard } from "@/components/restaurant-card";

const CATEGORY_SUGGESTIONS = [
  { label: "한식 어때요?", query: "한식", emoji: "🍚" },
  { label: "일식 어때요?", query: "일식", emoji: "🍣" },
  { label: "중식 어때요?", query: "중식", emoji: "🥟" },
  { label: "양식 어때요?", query: "양식", emoji: "🍝" },
  { label: "카페 갈까요?", query: "카페", emoji: "☕" },
  { label: "분식 어때요?", query: "분식", emoji: "🍢" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: popularRestaurants } = await supabase
    .from("restaurants")
    .select("id, name, address, category, kona_card_status, like_count")
    .order("like_count", { ascending: false, nullsFirst: false })
    .limit(5);

  const { data: recentRestaurants } = await supabase
    .from("restaurants")
    .select("id, name, address, category, kona_card_status, like_count")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-primary">배곱</span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          함께 만들어가는 회사 주변 맛집 추천 서비스
        </p>

        {/* CTA 버튼 */}
        <Button size="lg" className="mt-8 gap-2" asChild>
          <Link href="/random">
            <Shuffle className="size-4" />
            오늘 뭐 먹지?
          </Link>
        </Button>

        {/* Fake 검색 바 */}
        <Link
          href="/search"
          className="mt-6 flex w-full max-w-md items-center gap-2 rounded-md border bg-background px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50"
        >
          <Search className="size-4 shrink-0" />
          맛집 이름으로 검색...
        </Link>
      </section>

      {/* 카테고리별 추천 */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UtensilsCrossed className="size-5" />
          카테고리별 추천
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORY_SUGGESTIONS.map((cat) => (
            <Link key={cat.query} href={`/search?q=${encodeURIComponent(cat.query)}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 인기 맛집 */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ThumbsUp className="size-5" />
          인기 맛집
        </h2>
        {popularRestaurants && popularRestaurants.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {popularRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 등록된 맛집이 없습니다. 첫 번째 맛집을 등록해보세요!
          </p>
        )}
      </section>

      {/* 최근 등록된 맛집 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="size-5" />
          최근 등록된 맛집
        </h2>
        {recentRestaurants && recentRestaurants.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recentRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 등록된 맛집이 없습니다.
          </p>
        )}
      </section>
    </main>
  );
}
