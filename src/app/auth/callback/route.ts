import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRandomAvatarUrl, generateRandomNickname } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  if (!code) {
    const params = new URLSearchParams({ error: "auth" });
    if (errorCode) params.set("error_code", errorCode);
    if (errorDescription) params.set("error_description", errorDescription);
    return NextResponse.redirect(`${origin}/signin?${params}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const params = new URLSearchParams({ error: "auth" });
    if (error.code) params.set("error_code", error.code);
    return NextResponse.redirect(`${origin}/signin?${params}`);
  }

  // OAuth 신규 가입 시 배곱 기본 프로필 이미지 + 랜덤 닉네임 설정
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", data.user.id)
    .single();

  if (!profile?.nickname) {
    await supabase
      .from("profiles")
      .update({
        nickname: generateRandomNickname(),
        avatar_url: generateRandomAvatarUrl(),
      })
      .eq("id", data.user.id);
  }

  return NextResponse.redirect(`${origin}${redirect || "/"}`);
}
