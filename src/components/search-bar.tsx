import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SearchBarAvatar } from "./search-bar-avatar";

export async function SearchBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="fixed inset-x-0 top-0 z-40 px-4 py-3">
      <div className="bg-background mx-auto flex h-11 max-w-4xl items-center gap-3 rounded-full border px-4 shadow-sm">
        <Link href="/">
          <img
            src="/baegop-logo.svg"
            alt="배곱"
            width={24}
            height={24}
            className="shrink-0"
          />
        </Link>
        <Link
          href="/search"
          className="text-muted-foreground min-w-0 flex-1 items-center truncate"
        >
          찾고 싶은 장소가 있나요?
        </Link>
        <div className="flex shrink-0 items-center">
          {user && <SearchBarAvatar />}
        </div>
      </div>
    </div>
  );
}
