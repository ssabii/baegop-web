import { redirect } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { profileQueryKey } from "@/hooks/use-profile";
import { SubHeader } from "@/components/sub-header";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: profileQueryKey(user.id),
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", user.id)
        .single();
      return {
        nickname: profile?.nickname ?? user.email ?? "사용자",
        avatarUrl: profile?.avatar_url ?? null,
        email: user.email ?? null,
      };
    },
  });

  return (
    <div className="min-h-dvh flex flex-col">
      <SubHeader title="프로필" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProfileEditForm userId={user.id} />
      </HydrationBoundary>
    </div>
  );
}
