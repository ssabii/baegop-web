import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="sticky top-0 z-40 px-4 py-3 backdrop-blur">
      <div className="flex h-11 items-center rounded-full bg-muted/80">
        <Link
          href="/search"
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/baegop.svg"
            alt="배곱"
            width={20}
            height={20}
            className="shrink-0"
          />
          <span className="truncate text-sm text-muted-foreground">
            장소 이름으로 검색
          </span>
        </Link>
        {user && (
          <Link href="/mypage" className="shrink-0 pr-2">
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
  );
}
