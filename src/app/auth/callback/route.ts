import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const params = new URLSearchParams({ error: "auth" });
    if (error.code) params.set("error_code", error.code);
    return NextResponse.redirect(`${origin}/signin?${params}`);
  }

  return NextResponse.redirect(`${origin}${redirect || "/"}`);
}
