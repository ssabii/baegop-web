import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
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
    <main className="bg-muted w-full h-screen">
      <div className="px-4 py-8">
        <nav className="flex flex-col gap-3" aria-labelledby="mypage-menu">
          {/* 메뉴 리스트 */}
          <h2 id="mypage-menu" className="sr-only">
            마이페이지 메뉴
          </h2>

          {/* 프로필 섹션 */}
          <ItemGroup>
            <Item asChild className="gap-2">
              <Link href="/mypage/profile">
                <ItemMedia
                  variant="icon"
                  className="shrink-0 size-14 bg-transparent border-none"
                >
                  <Avatar className="size-14">
                    <AvatarImage
                      className="object-cover"
                      src={
                        profile?.avatar_url
                          ? optimizeSupabaseImageUrl(profile.avatar_url)
                          : undefined
                      }
                    />
                    <AvatarFallback>
                      <UserRound className="size-12 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="flex-1 gap-0">
                  <ItemTitle className="text-xl font-bold line-clamp-1">
                    {nickname}
                  </ItemTitle>
                  <ItemDescription className="text-base line-clamp-1">
                    {user.email}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="shrink-0">
                  <ChevronRight className="size-5" />
                </ItemActions>
              </Link>
            </Item>
          </ItemGroup>

          <ItemGroup className="rounded-xl bg-background">
            <Item asChild>
              <Link href="/mypage/theme">
                <ItemContent>
                  <ItemTitle className="font-bold">테마</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="size-4" />
                </ItemActions>
              </Link>
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
            {user.app_metadata.providers?.includes("email") && (
              <Item asChild>
                <Link href="/reset-password">
                  <ItemContent>
                    <ItemTitle className="font-bold">비밀번호 변경</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRight className="size-4" />
                  </ItemActions>
                </Link>
              </Item>
            )}
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
