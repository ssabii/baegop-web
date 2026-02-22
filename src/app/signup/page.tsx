import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm">
        <SignUpForm error={params.error} redirectTo={params.redirect} />
      </div>
    </div>
  );
}
