import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { buildProfile } from "@/lib/profile";
import { profileKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";

export { getMaskedEmail } from "@/lib/profile";
export type { Profile } from "@/lib/profile";

export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: profileKeys.all,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url, total_points")
        .eq("id", user.id)
        .single();

      return buildProfile(user, profile);
    },
    staleTime: QUERY_STALE_TIME,
    gcTime: 30 * 60 * 1000,
  });

  return { profile: data ?? null, isLoading };
}
