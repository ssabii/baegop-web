import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-dvh flex flex-col">
      <SubHeader title="프로필" />
      <ProfileEditForm
        userId={user.id}
        initialNickname={profile?.nickname ?? ""}
        initialAvatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  );
}
