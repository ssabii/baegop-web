import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ placeIds: [] });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("place_id")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ placeIds: [] });
  }

  const placeIds = data.map((row) => row.place_id);
  return NextResponse.json({ placeIds });
}
