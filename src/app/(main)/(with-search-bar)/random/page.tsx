import { Shuffle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Roulette } from "./roulette";

export default async function RandomPage() {
  const supabase = await createClient();

  const { data: places } = await supabase
    .from("places")
    .select("id, naver_place_id, name, address, category, kona_card_status, image_urls");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Shuffle className="size-6" />
        오늘 뭐 먹지?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        버튼을 눌러 랜덤으로 장소를 추천받아보세요!
      </p>

      <div className="mt-8">
        <Roulette places={places ?? []} />
      </div>
    </main>
  );
}
