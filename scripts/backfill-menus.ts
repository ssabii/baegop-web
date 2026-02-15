/**
 * 네이버 플레이스 메뉴 크롤링 backfill 스크립트
 *
 * 실행:
 *   npx tsx --env-file=.env.local scripts/backfill-menus.ts
 *   npx tsx --env-file=.env.local scripts/backfill-menus.ts --all  # 전체 재설정
 *
 * DB에 naver_place_id가 있는 맛집들의 메뉴를 크롤링하여
 * restaurant_menus 테이블에 저장한다.
 */

import puppeteer, { type Page, type Browser } from "puppeteer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("환경변수 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ParsedMenu {
  name: string;
  price: string | null;
  description: string | null;
  images: string[];
  recommend: boolean;
  priority: number;
}

/** 딜레이 유틸 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** GraphQL 응답에서 메뉴 데이터 추출 */
function extractMenusFromGraphQL(data: unknown): ParsedMenu[] {
  const menus: ParsedMenu[] = [];

  try {
    // GraphQL 응답은 배열 형태
    const responses = Array.isArray(data) ? data : [data];

    for (const resp of responses) {
      // 다양한 경로에서 메뉴 데이터 탐색
      const menuInfo =
        resp?.data?.restaurant?.newMenuItems ??
        resp?.data?.restaurant?.menus ??
        resp?.data?.business?.menus ??
        resp?.data?.restaurant?.menuInfo?.menuItems ??
        null;

      if (!menuInfo || !Array.isArray(menuInfo)) continue;

      for (let i = 0; i < menuInfo.length; i++) {
        const item = menuInfo[i];
        if (!item?.name) continue;

        const images: string[] = [];
        if (item.images && Array.isArray(item.images)) {
          for (const img of item.images) {
            const url = img?.url ?? img;
            if (typeof url === "string") images.push(url);
          }
        }
        if (item.imageUrl && typeof item.imageUrl === "string") {
          images.push(item.imageUrl);
        }

        menus.push({
          name: item.name,
          price: item.price ?? null,
          description: item.description ?? null,
          images,
          recommend: item.recommend === true || item.isPopular === true || item.isRecommend === true,
          priority: item.priority ?? i,
        });
      }
    }
  } catch {
    // 파싱 실패 시 빈 배열 반환
  }

  return menus;
}

/** DOM에서 직접 메뉴 파싱 (GraphQL 실패 시 폴백) */
async function extractMenusFromDOM(page: Page): Promise<ParsedMenu[]> {
  return page.evaluate(() => {
    const menus: Array<{
      name: string;
      price: string | null;
      description: string | null;
      images: string[];
      recommend: boolean;
      priority: number;
    }> = [];

    // 가격 패턴(숫자+원)이 포함된 li 요소를 메뉴 아이템으로 판단
    // 네이버 플레이스 모바일의 클래스명은 난독화되어 자주 바뀌므로
    // 구조(li + 가격 텍스트)에 의존
    const listItems = document.querySelectorAll("li");

    let priority = 0;
    listItems.forEach((li) => {
      const text = (li as HTMLElement).innerText ?? "";
      if (!/[\d,]+원/.test(text) || text.length > 300) return;

      // 텍스트를 줄바꿈으로 분리: ["대표", "메뉴명", "18,000원"] 또는 ["메뉴명", "18,000원"]
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      let name: string | null = null;
      let price: string | null = null;
      let recommend = false;

      for (const line of lines) {
        if (/^[\d,]+원$/.test(line)) {
          price = line;
        } else if (line === "대표" || line === "인기" || line === "추천") {
          recommend = true;
        } else if (!name) {
          name = line;
        }
      }

      if (!name) return;

      const imgEl = li.querySelector("img");
      const images: string[] = [];
      if (imgEl?.src && !imgEl.src.includes("icon")) {
        images.push(imgEl.src);
      }

      menus.push({
        name,
        price,
        description: null,
        images,
        recommend,
        priority: priority++,
      });
    });

    return menus;
  });
}

/** 단일 맛집 메뉴 크롤링 */
async function crawlMenus(
  browser: Browser,
  naverPlaceId: string
): Promise<ParsedMenu[]> {
  const page = await browser.newPage();
  let graphqlMenus: ParsedMenu[] = [];

  try {
    // User-Agent 설정 (모바일)
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    );

    // GraphQL 응답 인터셉트
    page.on("response", async (response) => {
      try {
        const url = response.url();
        if (!url.includes("place.naver.com/graphql")) return;

        const contentType = response.headers()["content-type"] ?? "";
        if (!contentType.includes("json")) return;

        const json = await response.json();
        const extracted = extractMenusFromGraphQL(json);
        if (extracted.length > 0) {
          graphqlMenus = extracted;
        }
      } catch {
        // 응답 파싱 실패 무시
      }
    });

    const url = `https://m.place.naver.com/restaurant/${naverPlaceId}/menu/list`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // 메뉴 렌더링 대기
    await delay(2000);

    // GraphQL에서 가져온 메뉴가 있으면 사용
    if (graphqlMenus.length > 0) {
      return graphqlMenus;
    }

    // 폴백: DOM 파싱
    const domMenus = await extractMenusFromDOM(page);
    return domMenus;
  } finally {
    await page.close();
  }
}

async function main() {
  const forceAll = process.argv.includes("--all");

  if (forceAll) {
    console.log("🔄 전체 맛집 메뉴 재설정 모드\n");
  }

  console.log("🔍 맛집 조회 중...");

  // naver_place_id가 있는 맛집 조회
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("id, name, naver_place_id")
    .not("naver_place_id", "is", null);

  if (error) {
    console.error("맛집 조회 실패:", error.message);
    process.exit(1);
  }

  let targets: typeof restaurants;

  if (forceAll) {
    targets = restaurants ?? [];
  } else {
    // 이미 메뉴가 있는 맛집 제외
    const { data: existingMenuRestaurants } = await supabase
      .from("restaurant_menus")
      .select("restaurant_id");

    const existingIds = new Set(
      (existingMenuRestaurants ?? []).map((r) => r.restaurant_id)
    );

    targets = (restaurants ?? []).filter((r) => !existingIds.has(r.id));
  }

  if (targets.length === 0) {
    console.log("✅ 크롤링 대상 맛집이 없습니다.");
    return;
  }

  console.log(`📋 크롤링 대상: ${targets.length}개 맛집\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  try {
    for (let i = 0; i < targets.length; i++) {
      const restaurant = targets[i];
      const progress = `[${i + 1}/${targets.length}]`;

      try {
        console.log(`${progress} ${restaurant.name} (${restaurant.naver_place_id}) 크롤링 중...`);

        const menus = await crawlMenus(browser, restaurant.naver_place_id!);

        if (menus.length === 0) {
          console.log(`  ⏭️  메뉴 없음 (스킵)`);
          skipCount++;
        } else {
          // 기존 메뉴 삭제 후 재삽입
          await supabase
            .from("restaurant_menus")
            .delete()
            .eq("restaurant_id", restaurant.id);

          const rows = menus.map((m) => ({
            restaurant_id: restaurant.id,
            name: m.name,
            price: m.price,
            description: m.description,
            images: m.images.length > 0 ? m.images : null,
            recommend: m.recommend,
            priority: m.priority,
          }));

          const { error: insertError } = await supabase
            .from("restaurant_menus")
            .insert(rows);

          if (insertError) {
            console.error(`  ❌ 저장 실패: ${insertError.message}`);
            failCount++;
          } else {
            console.log(`  ✅ ${menus.length}개 메뉴 저장 완료`);
            successCount++;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ 크롤링 실패: ${message}`);
        failCount++;
      }

      // rate limit 방지: 2~4초 랜덤 딜레이
      if (i < targets.length - 1) {
        const waitMs = 2000 + Math.random() * 2000;
        await delay(waitMs);
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\n========== 결과 ==========");
  console.log(`✅ 성공: ${successCount}`);
  console.log(`⏭️  스킵 (메뉴 없음): ${skipCount}`);
  console.log(`❌ 실패: ${failCount}`);
  console.log(`📊 전체: ${targets.length}`);
}

main().catch((err) => {
  console.error("스크립트 오류:", err);
  process.exit(1);
});
