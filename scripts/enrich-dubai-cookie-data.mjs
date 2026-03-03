/**
 * 두쫀쿠 매장 데이터를 네이버 플레이스 API로 보강하는 스크립트.
 *
 * 사용법:
 *   node scripts/enrich-dubai-cookie-data.mjs
 *
 * 네이버 getPlaceDetail GraphQL API를 호출하여 기존 458개 매장에
 * category, roadAddress, phone, imageUrl 필드를 추가한다.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "../src/data/dubai-cookie-stores.ts");

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/place/graphql";
const GRAPHQL_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  Referer: "https://m.place.naver.com/",
  Origin: "https://m.place.naver.com",
};

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

/** 기존 TS 파일에서 배열 데이터를 파싱한다. */
function parseExistingData() {
  const content = readFileSync(DATA_FILE, "utf-8");
  const stores = [];
  // 각 줄에서 객체 리터럴을 정규식으로 파싱
  const lineRegex =
    /\{\s*placeId:\s*"([^"]*)",\s*name:\s*"([^"]*)",\s*address:\s*"([^"]*)",\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = lineRegex.exec(content)) !== null) {
    stores.push({
      placeId: m[1],
      name: m[2],
      address: m[3],
      lat: parseFloat(m[4]),
      lng: parseFloat(m[5]),
    });
  }
  if (stores.length === 0)
    throw new Error("Cannot parse DUBAI_COOKIE_STORES array");
  return stores;
}

/** 네이버 getPlaceDetail GraphQL API 호출 */
async function fetchPlaceDetail(placeId) {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: GRAPHQL_HEADERS,
      body: JSON.stringify([
        {
          operationName: "getPlaceDetail",
          variables: { input: { id: placeId } },
          query: `query getPlaceDetail($input: PlaceDetailInput!) {
            placeDetail(input: $input) {
              base { id name address roadAddress phone category coordinate { x y } }
              images { images { origin } }
            }
          }`,
        },
      ]),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const detail = json[0]?.data?.placeDetail;
    if (!detail?.base) return null;

    const base = detail.base;
    const firstImage =
      detail.images?.images?.[0]?.origin ?? null;

    return {
      name: base.name ?? null,
      category: base.category ?? "",
      address: base.address ?? "",
      roadAddress: base.roadAddress ?? "",
      phone: base.phone || null,
      imageUrl: firstImage,
    };
  } catch (e) {
    console.error(`  [FAIL] ${placeId}: ${e.message}`);
    return null;
  }
}

function escapeString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** 보강된 데이터를 TS 파일로 쓴다. */
function writeEnrichedData(stores) {
  const lines = stores.map((s) => {
    const parts = [
      `placeId: "${s.placeId}"`,
      `name: "${escapeString(s.name)}"`,
      `category: "${escapeString(s.category)}"`,
      `address: "${escapeString(s.address)}"`,
      `roadAddress: "${escapeString(s.roadAddress)}"`,
      `phone: ${s.phone ? `"${escapeString(s.phone)}"` : "null"}`,
      `lat: ${s.lat}`,
      `lng: ${s.lng}`,
      `imageUrl: ${s.imageUrl ? `"${escapeString(s.imageUrl)}"` : "null"}`,
    ];
    return `  { ${parts.join(", ")} }`;
  });

  const content = `export interface DubaiCookieStore {
  placeId: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string | null;
  lat: number;
  lng: number;
  imageUrl: string | null;
}

export const DUBAI_COOKIE_STORES: DubaiCookieStore[] = [
${lines.join(",\n")},
];
`;

  writeFileSync(DATA_FILE, content, "utf-8");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("기존 데이터 로드 중...");
  const stores = parseExistingData();
  console.log(`총 ${stores.length}개 매장 로드 완료\n`);

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < stores.length; i += BATCH_SIZE) {
    const batch = stores.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(stores.length / BATCH_SIZE);
    console.log(
      `배치 ${batchNum}/${totalBatches} (${i + 1}~${Math.min(i + BATCH_SIZE, stores.length)})...`,
    );

    const results = await Promise.all(
      batch.map(async (store) => {
        const detail = await fetchPlaceDetail(store.placeId);
        if (detail) {
          return {
            ...store,
            name: detail.name || store.name,
            category: detail.category || "",
            roadAddress: detail.roadAddress || "",
            phone: detail.phone,
            imageUrl: detail.imageUrl,
          };
        }
        // API 실패 시 기존 데이터 유지 (새 필드는 기본값)
        return {
          ...store,
          category: store.category || "",
          roadAddress: store.roadAddress || "",
          phone: store.phone || null,
          imageUrl: store.imageUrl || null,
        };
      }),
    );

    results.forEach((result, idx) => {
      stores[i + idx] = result;
      if (result.imageUrl !== null || result.category !== "") {
        enriched++;
      } else {
        failed++;
      }
    });

    if (i + BATCH_SIZE < stores.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`\n보강 완료: 성공 ${enriched}, 실패 ${failed}`);
  console.log("데이터 파일 저장 중...");
  writeEnrichedData(stores);
  console.log(`저장 완료: ${DATA_FILE}`);
}

main().catch(console.error);
