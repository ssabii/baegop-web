import { createClient } from "@/lib/supabase/server";
import { MapView } from "./map-view";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: places } = await supabase
    .from("places")
    .select("id, name, category, lat, lng")
    .not("lat", "is", null)
    .not("lng", "is", null);

  const markers =
    places?.map((r) => ({
      id: r.id,
      lat: r.lat!,
      lng: r.lng!,
      title: r.name,
      category: r.category as string | null,
    })) ?? [];

  return (
    <main className="fixed inset-x-0 top-0 bottom-15">
      <MapView markers={markers} className="size-full" />
    </main>
  );
}
