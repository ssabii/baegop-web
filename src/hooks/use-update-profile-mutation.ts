import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Profile, profileQueryKey } from "./use-profile";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { nickname?: string; avatarUrl?: string }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const dbUpdates: Record<string, string> = {};
      if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname;
      if (updates.avatarUrl !== undefined)
        dbUpdates.avatar_url = updates.avatarUrl;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", user.id);

      if (error) throw new Error("프로필 수정에 실패했습니다.");
    },
    onSuccess: (_, updates) => {
      queryClient.setQueryData<Profile>(profileQueryKey, (old) =>
        old ? { ...old, ...updates } : old,
      );
    },
  });
}
