import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { LogoutMenuItem } from "./logout-menu-item";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

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
          <ItemGroup className="rounded-xl bg-background">
            <Item size="sm" className="text-muted-foreground">
              <ItemContent>
                <ItemTitle className="font-bold">테마</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Item>
          </ItemGroup>
          <ItemGroup className="rounded-xl bg-background">
            <Item asChild>
              <Link href="/mypage/reviews">
                <ItemContent>
                  <ItemTitle className="font-bold">내 리뷰</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="text-sm text-muted-foreground font-semibold">
                    {reviewCount ?? 0}
                  </span>
                  <ChevronRight className="size-4" />
                </ItemActions>
              </Link>
            </Item>
            <Item asChild>
              <Link href="/mypage/places">
                <ItemContent>
                  <ItemTitle className="font-bold">내 장소</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="text-sm text-muted-foreground font-semibold">
                    {placeCount ?? 0}
                  </span>
                  <ChevronRight className="size-4" />
                </ItemActions>
              </Link>
            </Item>
          </ItemGroup>
          <ItemGroup className="rounded-xl bg-background">
            <Item className="text-muted-foreground">
              <ItemContent>
                <ItemTitle className="font-bold">공지사항</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Item>
          </ItemGroup>
          <ItemGroup className="rounded-xl bg-background">
            <LogoutMenuItem />
            <Item asChild>
              <Link href="/mypage/delete-account">
                <ItemContent>
                  <ItemTitle className="font-bold">회원탈퇴</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="size-4" />
                </ItemActions>
              </Link>
            </Item>
          </ItemGroup>
        </nav>
      </div>
    </main>
  );
}
