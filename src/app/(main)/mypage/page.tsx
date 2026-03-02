import { ItemGroup } from "@/components/ui/item";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutMenuItem } from "./logout-menu-item";
import { MypageMenuItem } from "./mypage-menu-item";
import { ProfileSection } from "./profile-section";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const [{ count: reviewCount }, { count: favoriteCount }] = await Promise.all([
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <main className="w-full min-h-screen pb-17 bg-muted">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <nav className="flex flex-col gap-3" aria-labelledby="mypage-menu">
          {/* 메뉴 리스트 */}
          <h2 id="mypage-menu" className="sr-only">
            마이페이지 메뉴
          </h2>

          {/* 프로필 섹션 */}
          <ProfileSection />

          <MypageMenuItem href="/mypage/theme" title="테마" />
          <ItemGroup className="rounded-xl bg-background">
            <MypageMenuItem
              href="/mypage/reviews"
              title="내 리뷰"
              badge={
                <span className="text-sm text-muted-foreground font-semibold">
                  {reviewCount ?? 0}
                </span>
              }
              inGroup
            />
            <MypageMenuItem
              href="/mypage/places"
              title="내 장소"
              badge={
                <span className="text-sm text-muted-foreground font-semibold">
                  {favoriteCount ?? 0}
                </span>
              }
              inGroup
            />
          </ItemGroup>
          <ItemGroup className="rounded-xl bg-background">
            <MypageMenuItem href="/mypage/feedback" title="피드백 보내기" inGroup />
            <MypageMenuItem href="/terms" title="이용약관" inGroup />
            <MypageMenuItem href="/privacy" title="개인정보처리방침" inGroup />
          </ItemGroup>
          <ItemGroup className="rounded-xl bg-background">
            <LogoutMenuItem />
            {user.app_metadata.providers?.includes("email") && (
              <MypageMenuItem
                href="/reset-password"
                title="비밀번호 변경"
                inGroup
              />
            )}
            <MypageMenuItem
              href="/mypage/delete-account"
              title="회원탈퇴"
              variant="destructive"
              inGroup
            />
          </ItemGroup>
        </nav>
      </div>
    </main>
  );
}
