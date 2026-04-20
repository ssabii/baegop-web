import { redirect } from "next/navigation";
import { ItemGroup } from "@/components/ui/item";
import { createClient } from "@/lib/supabase/server";
import { LogoutMenuItem } from "./logout-menu-item";
import { MypageMenuItem } from "./mypage-menu-item";
import { ProfileSection } from "./profile-section";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const [{ count: reviewCount }, { count: favoriteCount }, { data: profile }] =
    await Promise.all([
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("total_points")
        .eq("id", user.id)
        .single(),
    ]);

  return (
    <main className="bg-muted min-h-screen w-full pb-17">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <nav className="flex flex-col gap-3" aria-labelledby="mypage-menu">
          {/* 메뉴 리스트 */}
          <h2 id="mypage-menu" className="sr-only">
            마이페이지 메뉴
          </h2>

          {/* 프로필 섹션 */}
          <ProfileSection />

          <MypageMenuItem href="/mypage/theme" title="테마" />
          <ItemGroup className="bg-background rounded-xl">
            <MypageMenuItem
              href="/mypage/reviews"
              title="내 리뷰"
              badge={
                <span className="text-muted-foreground text-sm font-semibold">
                  {reviewCount ?? 0}
                </span>
              }
              inGroup
            />
            <MypageMenuItem
              href="/mypage/places"
              title="내 장소"
              badge={
                <span className="text-muted-foreground text-sm font-semibold">
                  {favoriteCount ?? 0}
                </span>
              }
              inGroup
            />
            <MypageMenuItem
              href="/mypage/ranking"
              title="랭킹"
              badge={
                <span className="text-accent-foreground text-sm font-semibold">
                  {(profile?.total_points ?? 0).toLocaleString()}P
                </span>
              }
              newBadge
              inGroup
            />
            <MypageMenuItem
              href="/map/dubai-cookie"
              title="두쫀쿠 지도"
              newBadge
              inGroup
            />
          </ItemGroup>
          <ItemGroup className="bg-background rounded-xl">
            <MypageMenuItem
              href="/mypage/feedback"
              title="피드백 보내기"
              inGroup
            />
            <MypageMenuItem href="/terms" title="이용약관" inGroup />
            <MypageMenuItem href="/privacy" title="개인정보처리방침" inGroup />
          </ItemGroup>
          <ItemGroup className="bg-background rounded-xl">
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
