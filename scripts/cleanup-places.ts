/**
 * places 테이블 전체 삭제 (cascade로 reviews, reactions, kona_card_votes 등 함께 삭제)
 *
 * 실행:
 *   npx tsx --env-file=.env.local scripts/cleanup-places.ts
 *   npx tsx --env-file=.env.local scripts/cleanup-places.ts --dry-run
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "환경변수 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 현재 데이터 확인
  const { data: places, error: fetchError } = await supabase
    .from("places")
    .select("id, name, naver_place_id");

  if (fetchError) {
    console.error("조회 실패:", fetchError.message);
    process.exit(1);
  }

  if (!places || places.length === 0) {
    console.log("✅ places 테이블이 이미 비어 있습니다.");
    return;
  }

  console.log(`📋 삭제 대상: ${places.length}개 장소\n`);
  for (const p of places) {
    console.log(`  - [${p.id}] ${p.name} (naver_place_id: ${p.naver_place_id})`);
  }

  if (dryRun) {
    console.log("\n🏷️  DRY-RUN: 실제 삭제하지 않았습니다.");
    return;
  }

  // 전체 삭제 (cascade로 연관 데이터 함께 삭제)
  const { error: deleteError } = await supabase
    .from("places")
    .delete()
    .neq("id", 0); // 전체 삭제 (id > 0)

  if (deleteError) {
    console.error("\n❌ 삭제 실패:", deleteError.message);
    process.exit(1);
  }

  console.log(`\n✅ ${places.length}개 장소 및 연관 데이터 삭제 완료.`);
}

main().catch((err) => {
  console.error("스크립트 오류:", err);
  process.exit(1);
});
