import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "./signin-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
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
    <div className="flex h-dvh items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm">
        <SignInForm redirectTo={params.redirect} error={params.error} />
      </div>
    </div>
  );
}
