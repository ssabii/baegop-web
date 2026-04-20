/**
 * 네이버 플레이스 ID 일괄 확보 backfill 스크립트
 *
 * 실행:
 *   npx tsx --env-file=.env.local scripts/backfill-place-ids.ts
 *   npx tsx --env-file=.env.local scripts/backfill-place-ids.ts --all       # 전체 재설정
 *   npx tsx --env-file=.env.local scripts/backfill-place-ids.ts --dry-run   # 매칭 결과만 확인
 *   npx tsx --env-file=.env.local scripts/backfill-place-ids.ts --all --dry-run
 *
 * naver_place_id가 없는 맛집들을 네이버 플레이스에서 검색하여
 * place ID를 확보하고 DB에 저장한다.
 */

import { createClient } from "@supabase/supabase-js";
import puppeteer, { type Browser } from "puppeteer";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "환경변수 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PlaceCandidate {
  id: string;
  name: string;
  address: string;
}

/**
 * Puppeteer로 네이버 플레이스 검색하여 place ID 추출
 * 검색 결과 중 주소가 가장 일치하는 항목을 선택
 */
async function searchPlaceId(
  browser: Browser,
  name: string,
  address: string
): Promise<PlaceCandidate | null> {
  const page = await browser.newPage();
  const candidates: PlaceCandidate[] = [];

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    );

    // GraphQL 응답에서 검색 결과 수집
    page.on("response", async (response) => {
      try {
        const url = response.url();
        if (!url.includes("place.naver.com/graphql")) return;

        const contentType = response.headers()["content-type"] ?? "";
        if (!contentType.includes("json")) return;

        const json = await response.json();
        const responses = Array.isArray(json) ? json : [json];

        for (const resp of responses) {
          const items =
            resp?.data?.restaurants?.items ??
            resp?.data?.restaurantListV2?.items ??
            resp?.data?.searchResult?.items ??
            resp?.data?.businesses?.items ??
            [];

          if (Array.isArray(items)) {
            for (const item of items) {
              const id = item?.id ?? item?.businessId ?? item?.placeId;
              if (!id) continue;
              candidates.push({
                id: String(id),
                name: item.name ?? "",
                address:
                  item.fullAddress ?? item.roadAddress ?? item.address ?? "",
              });
            }
          }
        }
      } catch {
        // 응답 파싱 실패 무시
      }
    });

    // 검색 쿼리: 이름만 사용 (주소 붙이면 검색 결과 0건 되는 경우 많음)
    const searchUrl = `https://m.place.naver.com/restaurant/list?query=${encodeURIComponent(name)}`;

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await delay(2000);

    // GraphQL 결과에서 주소 매칭
    if (candidates.length > 0) {
      return pickBestMatch(candidates, name, address);
    }

    // 폴백: DOM에서 링크로 place ID 추출
    const domPlaceId = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/restaurant/"]');
      for (const link of links) {
        const href = link.getAttribute("href") ?? "";
        const match = href.match(/\/restaurant\/(\d+)/);
        if (match) return match[1];
      }
      return null;
    });

    return domPlaceId
      ? { id: domPlaceId, name: "(DOM 폴백)", address: "" }
      : null;
  } finally {
    await page.close();
  }
}

/** 지점명에서 핵심 지명 추출 (역삼역점 → 역삼, 서초본점 → 서초) */
function extractBranchCore(word: string): string {
  return word
    .replace(/\d*호?점$/, "") // 점, 1호점, 2호점 제거
    .replace(/(역|본|DT)$/, ""); // 역, 본, DT 접미사 제거
}

/** 이름 + 주소 복합 유사도로 가장 일치하는 후보 선택 */
function pickBestMatch(
  candidates: PlaceCandidate[],
  targetName: string,
  targetAddress: string
): PlaceCandidate {
  const targetAddrWords = targetAddress
    .replace(/[^\w가-힣]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  // DB 이름에서 브랜드(첫 단어) 제거 → 지점명 핵심 지명 추출
  const targetCores = targetName
    .trim()
    .split(/\s+/)
    .slice(1)
    .map(extractBranchCore)
    .filter(Boolean);

  const scored = candidates.map((c) => {
    // 주소 매칭 (동/로/길 단어에 가중치 2배)
    const cAddrWords = c.address
      .replace(/[^\w가-힣]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    let addrScore = 0;
    for (const w of targetAddrWords) {
      if (cAddrWords.some((cw) => cw.includes(w) || w.includes(cw))) {
        addrScore += /[동로길]$/.test(w) ? 2 : 1;
      }
    }

    // 이름 매칭 (핵심 지명 비교: 역삼역점→역삼 vs 역삼점→역삼)
    const cCores = c.name
      .trim()
      .split(/\s+/)
      .slice(1)
      .map(extractBranchCore)
      .filter(Boolean);
    let nameScore = 0;
    for (const tc of targetCores) {
      for (const cc of cCores) {
        if (cc.includes(tc) || tc.includes(cc)) {
          nameScore++;
          break;
        }
      }
    }

    return { candidate: c, score: nameScore * 2 + addrScore };
  });

  scored.sort((a, b) => b.score - a.score);

  // 상위 후보 로깅
  const top = scored
    .slice(0, 5)
    .map((s) => `${s.candidate.name}(score:${s.score})`)
    .join(", ");
  console.log(`  🔍 후보 ${candidates.length}개: ${top}`);

  return scored[0].candidate;
}

async function main() {
  const forceAll = process.argv.includes("--all");
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log("🏷️  DRY-RUN 모드: DB 업데이트 없이 매칭 결과만 출력\n");
  }
  if (forceAll) {
    console.log("🔄 전체 맛집 place ID 재설정 모드\n");
  }

  console.log("🔍 맛집 조회 중...");

  let query = supabase.from("places").select("id, name, address");
  if (!forceAll) {
    query = query.is("naver_place_id", null);
  }

  const { data: places, error } = await query;

  if (error) {
    console.error("맛집 조회 실패:", error.message);
    process.exit(1);
  }

  if (!places || places.length === 0) {
    console.log("✅ 모든 맛집에 place ID가 이미 등록되어 있습니다.");
    return;
  }

  console.log(`📋 대상: ${places.length}개 맛집\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let successCount = 0;
  let failCount = 0;

  try {
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      const progress = `[${i + 1}/${places.length}]`;

      try {
        console.log(`${progress} ${place.name} 검색 중...`);

        const match = await searchPlaceId(
          browser,
          place.name,
          place.address
        );

        if (!match) {
          console.log(`  ⚠️  place ID를 찾지 못했습니다`);
          failCount++;
        } else if (dryRun) {
          console.log(
            `  ✅ 매칭: ${match.id} (${match.name})  [DRY-RUN]`
          );
          successCount++;
        } else {
          const { error: updateError } = await supabase
            .from("places")
            .update({ naver_place_id: match.id })
            .eq("id", place.id);

          if (updateError) {
            console.error(`  ❌ 업데이트 실패: ${updateError.message}`);
            failCount++;
          } else {
            console.log(`  ✅ place ID 저장: ${match.id} (${match.name})`);
            successCount++;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ 검색 실패: ${message}`);
        failCount++;
      }

      // rate limit 방지: 2~3초 랜덤 딜레이
      if (i < places.length - 1) {
        const waitMs = 2000 + Math.random() * 1000;
        await delay(waitMs);
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\n========== 결과 ==========");
  console.log(`✅ 성공: ${successCount}`);
  console.log(`❌ 실패: ${failCount}`);
  console.log(`📊 전체: ${places.length}`);
}

main().catch((err) => {
  console.error("스크립트 오류:", err);
  process.exit(1);
});
