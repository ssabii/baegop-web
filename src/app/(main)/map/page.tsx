import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MapView } from "./map-view";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, lat, lng")
    .not("lat", "is", null)
    .not("lng", "is", null);

  const markers =
    restaurants?.map((r) => ({
      lat: r.lat!,
      lng: r.lng!,
      title: r.name,
    })) ?? [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <MapPin className="size-6" />
        지도
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        등록된 맛집을 지도에서 확인해보세요.
      </p>

      <div className="mt-6">
        <MapView markers={markers} />
      </div>
    </main>
  );
}
