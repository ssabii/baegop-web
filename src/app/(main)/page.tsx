import Link from "next/link";
import { Search, Shuffle, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORY_SUGGESTIONS = [
  { label: "한식 어때요?", query: "한식", emoji: "🍚" },
  { label: "일식 어때요?", query: "일식", emoji: "🍣" },
  { label: "중식 어때요?", query: "중식", emoji: "🥟" },
  { label: "양식 어때요?", query: "양식", emoji: "🍝" },
  { label: "카페 갈까요?", query: "카페", emoji: "☕" },
  { label: "분식 어때요?", query: "분식", emoji: "🍢" },
];

export default function HomePage() {
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
          <Link href="/search">
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

      {/* 최근/인기 맛집 플레이스홀더 */}
      <section className="mt-16">
        <h2 className="text-lg font-semibold">인기 맛집</h2>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              준비 중입니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              리뷰가 쌓이면 인기 맛집이 여기에 표시됩니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">최근 등록된 맛집</h2>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              준비 중입니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              새로 등록된 맛집이 여기에 표시됩니다.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
