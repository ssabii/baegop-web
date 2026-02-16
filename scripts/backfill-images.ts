/**
 * 맛집 이미지 일괄 확보 backfill 스크립트
 *
 * 실행:
 *   npx tsx --env-file=.env.local scripts/backfill-images.ts
 *   npx tsx --env-file=.env.local scripts/backfill-images.ts --all  # 전체 재설정
 *
 * 1) naver_place_id가 있는 맛집 → 네이버 플레이스 페이지에서 크롤링 (정확도 높음)
 * 2) naver_place_id가 없는 맛집 → 네이버 이미지 검색 API 폴백
 */

import puppeteer, { type Browser } from "puppeteer";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const naverClientId = process.env.NAVER_CLIENT_ID;
const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다."
  );
  process.exit(1);
}

// Service Role Key를 사용해 RLS를 우회 (anon key로는 update가 차단됨)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 네이버 플레이스 페이지에서 이미지 URL 크롤링 */
async function crawlPlaceImages(
  browser: Browser,
  naverPlaceId: string
): Promise<string[]> {
  const page = await browser.newPage();
  const imageUrls: string[] = [];

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    );

    // GraphQL 응답에서 이미지 URL 추출
    page.on("response", async (response) => {
      try {
        const url = response.url();
        if (!url.includes("place.naver.com/graphql")) return;

        const contentType = response.headers()["content-type"] ?? "";
        if (!contentType.includes("json")) return;

        const json = await response.json();
        const responses = Array.isArray(json) ? json : [json];

        for (const resp of responses) {
          // 여러 경로에서 이미지 데이터 탐색
          const photoLists = [
            resp?.data?.restaurant?.images,
            resp?.data?.restaurant?.businessPhotos,
            resp?.data?.restaurant?.photoList?.items,
            resp?.data?.business?.images,
            resp?.data?.business?.businessPhotos,
          ];

          for (const photos of photoLists) {
            if (!Array.isArray(photos)) continue;
            for (const photo of photos) {
              const imgUrl =
                photo?.origin ?? photo?.url ?? photo?.imageUrl ?? photo?.src;
              if (typeof imgUrl === "string" && imgUrl.startsWith("http")) {
                imageUrls.push(imgUrl);
              }
            }
          }
        }
      } catch {
        // 응답 파싱 실패 무시
      }
    });

    const url = `https://m.place.naver.com/restaurant/${naverPlaceId}/photo`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await delay(2000);

    // GraphQL에서 못 찾았으면 DOM에서 추출
    if (imageUrls.length === 0) {
      const domImages = await page.evaluate(() => {
        const imgs: string[] = [];
        const imgElements = document.querySelectorAll(
          'img[src*="pstatic.net"], img[src*="naver.net"]'
        );
        for (const img of imgElements) {
          const src = img.getAttribute("src");
          if (src && !src.includes("icon") && !src.includes("logo")) {
            imgs.push(src);
          }
        }
        return imgs;
      });
      imageUrls.push(...domImages);
    }

    // 중복 제거 + 최대 10장
    return [...new Set(imageUrls)].slice(0, 10);
  } finally {
    await page.close();
  }
}

/** 네이버 이미지 검색 API (place ID 없는 맛집용 폴백) */
async function fetchNaverImages(query: string): Promise<string[]> {
  if (!naverClientId || !naverClientSecret) return [];

  try {
    const url = new URL("https://openapi.naver.com/v1/search/image");
    url.searchParams.set("query", query);
    url.searchParams.set("display", "10");
    url.searchParams.set("sort", "sim");

    const res = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": naverClientId,
        "X-Naver-Client-Secret": naverClientSecret,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { items: { link: string }[] };
    return data.items.map((item) => item.link);
  } catch {
    return [];
  }
}

async function main() {
  const forceAll = process.argv.includes("--all");

  if (forceAll) {
    console.log("🔄 전체 맛집 이미지 재설정 모드\n");
  }

  console.log("🔍 맛집을 조회합니다...\n");

  let query = supabase.from("places").select("id, name, naver_place_id");
  if (!forceAll) {
    query = query.is("image_urls", null);
  }

  const { data: places, error } = await query;

  if (error) {
    console.error("❌ 맛집 조회 실패:", error.message);
    process.exit(1);
  }

  if (!places || places.length === 0) {
    console.log("✅ 모든 맛집에 이미지가 이미 등록되어 있습니다.");
    return;
  }

  const withPlaceId = places.filter((r) => r.naver_place_id);
  const withoutPlaceId = places.filter((r) => !r.naver_place_id);

  console.log(
    `📋 총 ${places.length}개 맛집 (Place 크롤링: ${withPlaceId.length}, API 폴백: ${withoutPlaceId.length})\n`
  );

  let successCount = 0;
  let failCount = 0;

  // 1) Puppeteer로 네이버 플레이스 이미지 크롤링
  if (withPlaceId.length > 0) {
    console.log("--- 네이버 플레이스 이미지 크롤링 ---\n");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      for (let i = 0; i < withPlaceId.length; i++) {
        const place = withPlaceId[i];
        const progress = `[${i + 1}/${withPlaceId.length}]`;

        try {
          console.log(
            `${progress} ${place.name} (${place.naver_place_id}) 크롤링 중...`
          );

          const images = await crawlPlaceImages(
            browser,
            place.naver_place_id!
          );

          if (images.length === 0) {
            console.log(`  ⚠️  이미지를 찾지 못했습니다`);
            failCount++;
          } else {
            const { error: updateError } = await supabase
              .from("places")
              .update({ image_urls: images })
              .eq("id", place.id);

            if (updateError) {
              console.log(`  ❌ 업데이트 실패: ${updateError.message}`);
              failCount++;
            } else {
              console.log(`  ✅ ${images.length}개 이미지 저장`);
              successCount++;
            }
          }
        } catch (err) {
          console.log(
            `  ❌ 크롤링 실패: ${err instanceof Error ? err.message : err}`
          );
          failCount++;
        }

        // rate limit 방지: 2~3초 랜덤 딜레이
        if (i < withPlaceId.length - 1) {
          const waitMs = 2000 + Math.random() * 1000;
          await delay(waitMs);
        }
      }
    } finally {
      await browser.close();
    }
  }

  // 2) 네이버 이미지 검색 API 폴백 (place ID 없는 맛집)
  if (withoutPlaceId.length > 0) {
    if (!naverClientId || !naverClientSecret) {
      console.log(
        `\n⚠️  NAVER API 키가 없어 ${withoutPlaceId.length}개 맛집의 이미지를 건너뜁니다.`
      );
      failCount += withoutPlaceId.length;
    } else {
      console.log("\n--- 네이버 이미지 검색 API 폴백 ---\n");

      for (let i = 0; i < withoutPlaceId.length; i++) {
        const place = withoutPlaceId[i];
        const progress = `[${i + 1}/${withoutPlaceId.length}]`;
        const query = `${place.name} 맛집`;

        try {
          console.log(`${progress} ${place.name} 이미지 검색 중...`);

          const images = await fetchNaverImages(query);

          if (images.length === 0) {
            console.log(`  ⚠️  검색 결과 없음`);
            failCount++;
          } else {
            const { error: updateError } = await supabase
              .from("places")
              .update({ image_urls: images })
              .eq("id", place.id);

            if (updateError) {
              console.log(`  ❌ 업데이트 실패: ${updateError.message}`);
              failCount++;
            } else {
              console.log(`  ✅ ${images.length}개 이미지 저장`);
              successCount++;
            }
          }
        } catch (err) {
          console.log(
            `  ❌ API 호출 실패: ${err instanceof Error ? err.message : err}`
          );
          failCount++;
        }

        await delay(200);
      }
    }
  }

  console.log(`\n🏁 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
}

main().catch((err) => {
  console.error("스크립트 오류:", err);
  process.exit(1);
});
