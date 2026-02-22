import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  nickname: string;
  avatarUrl: string | null;
  email: string | null;
}

export const profileQueryKey = ["profile"];

/** 이메일 @ 앞(로컬)만 마스킹. 앞 3자만 노출, 3자 이하는 전부 * */
export function getMaskedEmail(email: string): string {
  const [local, domain] = email.split("@");

  if (!local) return email;

  const maskedLocal =
    local.length <= 3
      ? local.replace(/./g, "*")
      : local.replace(/^(.{3}).*$/, "$1***");
  return domain ? `${maskedLocal}@${domain}` : maskedLocal;
}

export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", user.id)
        .single();

      const maskedEmail = user.email ? getMaskedEmail(user.email) : null;

      return {
        nickname: profile?.nickname ?? user.email ?? "사용자",
        avatarUrl: profile?.avatar_url ?? null,
        email: maskedEmail,
      } as Profile;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return { profile: data ?? null, isLoading };
}
