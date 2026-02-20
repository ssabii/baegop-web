import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SearchBar() {
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

  const displayName = profile?.nickname || user?.email || "사용자";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-x-0 top-0 z-40 px-4 py-3">
      <div className="flex h-11 items-center bg-background rounded-full max-w-4xl mx-auto border shadow-sm">
        <Link
          href="/search"
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2 shadow-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/baegop.svg"
            alt="배곱"
            width={20}
            height={20}
            className="shrink-0"
          />
          <span className="truncate text-muted-foreground">장소 검색</span>
        </Link>
        <div className="flex shrink-0 items-center pr-2">
          <ThemeToggle />
          {user && (
            <Link href="/mypage">
              <Avatar size="sm">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={displayName} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
