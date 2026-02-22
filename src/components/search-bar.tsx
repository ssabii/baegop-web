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
      <div className="flex h-11 items-center bg-background rounded-full max-w-4xl mx-auto border shadow-sm">
        <Link
          href="/search"
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2 shadow-none"
        >
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
          {user && <SearchBarAvatar />}
        </div>
      </div>
    </div>
  );
}
