/**
 * 두쫀쿠 매장 크롤링 스크립트
 * dubaicookiemap.com에서 매장 데이터를 추출하고,
 * 회사(크몽) 반경 ~2km 내 매장을 필터링합니다.
 *
 * 사용법: pnpm tsx scripts/crawl-dubai-cookie.ts
 */

import puppeteer from "puppeteer";

const COMPANY = { lat: 37.4924644, lng: 127.0268075 };
const RADIUS_KM = 2;

/** Haversine 공식으로 두 좌표 간 거리(km) 계산 */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface RawStore {
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  naver_place_url: string | null;
}

async function main() {
  console.log("🍪 두쫀쿠 매장 크롤링 시작...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  );

  // RSC payload 가로채기
  const stores: RawStore[] = [];

  page.on("response", async (response) => {
    const url = response.url();
    const contentType = response.headers()["content-type"] ?? "";

    // RSC payload 또는 JSON 응답에서 매장 데이터 추출
    if (
      url.includes("dubaicookiemap.com") &&
      (contentType.includes("json") ||
        contentType.includes("text/x-component") ||
        contentType.includes("text/plain"))
    ) {
      try {
        const text = await response.text();
        // JSON 배열 또는 객체에서 매장 데이터 추출 시도
        const jsonMatches = text.match(/\[[\s\S]*?\{[\s\S]*?"name"[\s\S]*?\}[\s\S]*?\]/g);
        if (jsonMatches) {
          for (const match of jsonMatches) {
            try {
              const parsed = JSON.parse(match);
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  if (item.name && (item.lat || item.lng)) {
                    stores.push({
                      name: item.name,
                      address: item.address ?? null,
                      lat: item.lat ? Number(item.lat) : null,
                      lng: item.lng ? Number(item.lng) : null,
                      naver_place_url: item.naver_place_url ?? null,
                    });
                  }
                }
              }
            } catch {
              // JSON 파싱 실패 — 무시
            }
          }
        }
      } catch {
        // 응답 읽기 실패 — 무시
      }
    }
  });

  await page.goto("https://dubaicookiemap.com", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  // 추가 데이터 로딩 대기
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // DOM에서도 데이터 추출 시도 (Next.js __NEXT_DATA__ 등)
  const domData = await page.evaluate(() => {
    // __NEXT_DATA__ 확인
    const nextData = (window as Record<string, unknown>).__NEXT_DATA__;
    if (nextData) return JSON.stringify(nextData);

    // script 태그에서 JSON 데이터 찾기
    const scripts = document.querySelectorAll('script[type="application/json"]');
    const results: string[] = [];
    scripts.forEach((s) => results.push(s.textContent ?? ""));
    return results.join("\n");
  });

  if (domData) {
    try {
      const parsed = JSON.parse(domData);
      // pageProps에서 데이터 추출
      const extractStores = (obj: Record<string, unknown>): void => {
        if (Array.isArray(obj)) {
          for (const item of obj) {
            if (
              item &&
              typeof item === "object" &&
              "name" in item &&
              ("lat" in item || "lng" in item)
            ) {
              const s = item as Record<string, unknown>;
              stores.push({
                name: String(s.name),
                address: s.address ? String(s.address) : null,
                lat: s.lat ? Number(s.lat) : null,
                lng: s.lng ? Number(s.lng) : null,
                naver_place_url: s.naver_place_url
                  ? String(s.naver_place_url)
                  : null,
              });
            }
          }
        } else if (obj && typeof obj === "object") {
          for (const value of Object.values(obj)) {
            if (value && typeof value === "object") {
              extractStores(value as Record<string, unknown>);
            }
          }
        }
      };
      extractStores(parsed);
    } catch {
      // 파싱 실패
    }
  }

  await browser.close();

  // 중복 제거 (이름 기준)
  const uniqueStores = Array.from(
    new Map(stores.map((s) => [s.name, s])).values(),
  );

  console.log(`📦 총 ${uniqueStores.length}개 매장 데이터 추출\n`);

  // 좌표가 있고, 반경 내인 매장 필터링
  const nearby = uniqueStores
    .filter((s) => s.lat && s.lng)
    .filter(
      (s) => haversineKm(COMPANY.lat, COMPANY.lng, s.lat!, s.lng!) <= RADIUS_KM,
    )
    .sort(
      (a, b) =>
        haversineKm(COMPANY.lat, COMPANY.lng, a.lat!, a.lng!) -
        haversineKm(COMPANY.lat, COMPANY.lng, b.lat!, b.lng!),
    );

  console.log(
    `📍 회사 반경 ${RADIUS_KM}km 내 매장: ${nearby.length}개\n`,
  );

  // TypeScript 배열 형태로 출력
  console.log("// src/data/dubai-cookie-stores.ts 에 붙여넣기:");
  console.log("export const DUBAI_COOKIE_STORES: DubaiCookieStore[] = [");
  for (const s of nearby) {
    const dist = haversineKm(COMPANY.lat, COMPANY.lng, s.lat!, s.lng!);
    console.log(`  {`);
    console.log(`    name: ${JSON.stringify(s.name)},`);
    console.log(`    address: ${JSON.stringify(s.address ?? "")},`);
    console.log(`    lat: ${s.lat},`);
    console.log(`    lng: ${s.lng},`);
    console.log(
      `    naverUrl: ${JSON.stringify(s.naver_place_url ?? "")},`,
    );
    console.log(`  }, // ${dist.toFixed(2)}km`);
  }
  console.log("];");
}

main().catch((err) => {
  console.error("오류:", err);
  process.exit(1);
});
