import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface MapPlace {
  id: string;
  name: string;
  category: string | null;
  lat: number;
  lng: number;
  address: string;
  image_urls: string[] | null;
}

export function useMapPlaces() {
  return useQuery({
    queryKey: ["map-places"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("places")
        .select("id, name, category, lat, lng, address, image_urls")
        .not("lat", "is", null)
        .not("lng", "is", null);

      if (error) throw new Error(error.message);
      return (data ?? []) as MapPlace[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
