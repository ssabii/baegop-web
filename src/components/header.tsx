import Link from "next/link";
import { List, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("nickname, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-primary">
            배곱
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/restaurants"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <List className="size-4 sm:hidden" />
              <span className="hidden sm:inline">맛집 목록</span>
            </Link>
            <Link
              href="/restaurants/new"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <PlusCircle className="size-4 sm:hidden" />
              <span className="hidden sm:inline">맛집 등록</span>
            </Link>
          </nav>
        </div>

        <AuthButton user={user} profile={profile} />
      </div>
    </header>
  );
}
