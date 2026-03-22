import { createClient } from "@/lib/supabase/server";

export interface RankingUser {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  total_points: number;
}

export interface RankingResult {
  items: RankingUser[];
  nextCursor: number | null;
}

const DEFAULT_LIMIT = 10;

const EXCLUDED_USER_IDS = [
  "76406f2a-810d-4ad4-b0ab-13b60bf14845",
  "ef926746-b13c-4f65-8cc5-ab424cc73948",
];

export async function fetchRanking(
  cursor = 0,
  limit = DEFAULT_LIMIT,
): Promise<RankingResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, total_points")
    .gt("total_points", 0)
    .not("id", "in", `(${EXCLUDED_USER_IDS.join(",")})`)
    .order("total_points", { ascending: false })
    .order("id")
    .range(cursor, cursor + limit - 1);

  if (error) throw new Error(error.message);

  const items = data ?? [];
  const nextCursor = items.length === limit ? cursor + limit : null;

  return { items, nextCursor };
}
