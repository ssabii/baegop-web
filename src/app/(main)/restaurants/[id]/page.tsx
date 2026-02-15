import { notFound } from "next/navigation";
import { ExternalLink, MapPin, Phone, Tag, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Card>
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
              <a href={`tel:${restaurant.telephone}`} className="hover:underline">
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
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="size-5" />
          리뷰
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          아직 리뷰가 없습니다.
        </p>
        <Button className="mt-4" disabled>
          리뷰 작성
        </Button>
      </section>
    </main>
  );
}
