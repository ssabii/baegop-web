import { List } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RestaurantCard } from "@/components/restaurant-card";

export default async function RestaurantsPage() {
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, address, category, kona_card_status, like_count")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <List className="size-6" />
        맛집 목록
      </h1>

      {restaurants && restaurants.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          아직 등록된 맛집이 없습니다. 검색에서 첫 번째 맛집을 등록해보세요!
        </p>
      )}
    </main>
  );
}
