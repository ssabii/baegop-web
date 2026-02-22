import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { LogoutMenuItem } from "./logout-menu-item";
import { ProfileSection } from "./profile-section";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const [{ count: reviewCount }, { count: placeCount }] = await Promise.all([
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("places")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id),
  ]);

  return (
    <main className="w-full max-w-4xl h-dvh mx-auto">
      <div className="px-4 py-8">
        <nav className="flex flex-col gap-3" aria-labelledby="mypage-menu">
          {/* 메뉴 리스트 */}
          <h2 id="mypage-menu" className="sr-only">
            마이페이지 메뉴
          </h2>

          {/* 프로필 섹션 */}
          <ProfileSection />

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
