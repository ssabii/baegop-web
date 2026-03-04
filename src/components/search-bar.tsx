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
      <div className="px-4 gap-3 flex h-11 items-center bg-background rounded-full max-w-4xl mx-auto border shadow-sm">
        <Link href="/">
          <img
            src="/baegop.svg"
            alt="배곱"
            width={24}
            height={24}
            className="shrink-0"
          />
        </Link>
        <Link
          href="/search"
          className="min-w-0 flex-1 items-center truncate text-muted-foreground"
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
