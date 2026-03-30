import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { profileKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  nickname: string;
  avatarUrl: string | null;
  email: string | null;
  totalPoints: number;
}


export function getMaskedEmail(email: string): string {
  const [local, domain] = email.split("@");

  if (!local) return email;

  const maskedLocal =
    local.length <= 2
      ? "*".repeat(local.length)
      : local.slice(0, 2) + "******";

  if (!domain) return maskedLocal;

  const dotIndex = domain.indexOf(".");
  if (dotIndex <= 0) return `${maskedLocal}@${"*******"}`;

  const maskedDomain =
    domain.slice(0, 1) + "*******" + domain.slice(dotIndex);

  return `${maskedLocal}@${maskedDomain}`;
}

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

      const maskedEmail = user.email ? getMaskedEmail(user.email) : null;

      return {
        nickname: profile?.nickname ?? user.email ?? "사용자",
        avatarUrl: profile?.avatar_url ?? null,
        email: maskedEmail,
        totalPoints: profile?.total_points ?? 0,
      } as Profile;
    },
    staleTime: QUERY_STALE_TIME,
    gcTime: 30 * 60 * 1000,
  });

  return { profile: data ?? null, isLoading };
}
