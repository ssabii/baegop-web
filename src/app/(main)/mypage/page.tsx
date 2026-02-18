import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  Megaphone,
  Star,
  UserPen,
  Building2,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count: reviewCount }, { count: placeCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("places")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id),
    ]);

  const nickname = profile?.nickname ?? user.email ?? "사용자";

  return (
    <main className="bg-muted/50 w-full h-svh">
      <div className="mx-auto max-w-4xl ">
        {/* 프로필 섹션 */}
        <div className="flex items-center gap-2 px-4 py-8">
          <Avatar className="size-12">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg">{nickname[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{nickname}</h1>
            <p className="text-sm text-muted-foreground font-medium">
              {user.email}
            </p>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex flex-col px-4 gap-3" aria-labelledby="mypage-menu">
          <h2 id="mypage-menu" className="sr-only">
            마이페이지 메뉴
          </h2>
          <div className="rounded-xl bg-background p-4">
            <MenuItem label="테마" disabled />
          </div>
          <div className="rounded-xl bg-background p-4 flex flex-col gap-4">
            <h3 className="text-bold text-base font-bold">장소 및 리뷰</h3>
            <MenuItem
              label="내 리뷰"
              href="/mypage/reviews"
              count={reviewCount ?? 0}
            />
            <MenuItem
              label="내 장소"
              href="/mypage/places"
              count={placeCount ?? 0}
            />
          </div>
          <div className="rounded-xl bg-background p-4">
            <MenuItem label="공지사항" disabled />
          </div>
          <div className="rounded-xl bg-background p-4 flex flex-col gap-4">
            <MenuItem label="로그아웃" disabled />
            <MenuItem label="회원탈퇴" disabled />
          </div>
        </nav>
      </div>
    </main>
  );
}

function MenuItem({
  label,
  href,
  count,
  disabled,
  variant,
}: {
  label: string;
  href?: string;
  count?: number;
  disabled?: boolean;
  variant?: "destructive";
}) {
  const content = (
    <>
      <span
        className={cn(
          "flex-1 text-sm font-semibold text-secondary-foreground",
          {
            "text-destructive": variant === "destructive",
            "text-muted-foreground/50": disabled && variant !== "destructive",
          },
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-sm font-semibold text-muted-foreground">
          {count}
        </span>
      )}
      {
        <ChevronRight
          className={cn("size-4 shrink-0 text-secondary-foreground", {
            "text-muted-foreground/50": disabled,
          })}
        />
      }
    </>
  );

  const baseClassName = "flex items-center gap-3";

  if (disabled || !href) {
    return <div className={baseClassName}>{content}</div>;
  }

  return (
    <Link href={href} className={cn(baseClassName, "active:bg-muted/50")}>
      {content}
    </Link>
  );
}
