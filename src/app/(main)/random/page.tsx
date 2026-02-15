import { Shuffle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Roulette } from "./roulette";

export default async function RandomPage() {
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, address, category, kona_card_status, like_count");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Shuffle className="size-6" />
        오늘 뭐 먹지?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        버튼을 눌러 랜덤으로 맛집을 추천받아보세요!
      </p>

      <div className="mt-8">
        <Roulette restaurants={restaurants ?? []} />
      </div>
    </main>
  );
}
