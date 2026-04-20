import { redirect } from "next/navigation";
import { SubHeader } from "@/components/sub-header";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="flex h-dvh flex-col">
      <SubHeader title="프로필" />
      <ProfileEditForm />
    </div>
  );
}
