import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { DeleteAccountForm } from "./delete-account-form";

export default async function DeleteAccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="h-dvh">
      <SubHeader title="회원탈퇴" />
      <DeleteAccountForm />
    </div>
  );
}
