import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
