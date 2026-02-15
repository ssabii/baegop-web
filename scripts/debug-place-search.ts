/**
 * 네이버 플레이스 검색 디버그 스크립트
 * GraphQL 응답 구조를 확인하기 위한 임시 스크립트
 */

import puppeteer from "puppeteer";

const name = process.argv[2] ?? "써브웨이 역삼역점";
const address = process.argv[3] ?? "서울특별시 강남구 역삼동";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const shortAddress = address.split(" ").slice(0, 3).join(" ");
  const query = `${name} ${shortAddress}`;
  const searchUrl = `https://m.place.naver.com/restaurant/list?query=${encodeURIComponent(query)}`;

  console.log(`🔍 검색 URL: ${searchUrl}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  );

  let responseCount = 0;

  page.on("response", async (response) => {
    const url = response.url();

    // GraphQL 응답 로깅
    if (url.includes("place.naver.com/graphql")) {
      responseCount++;
      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.includes("json")) return;

      try {
        const json = await response.json();
        console.log(`\n📦 GraphQL 응답 #${responseCount}`);
        console.log(`   URL: ${url.substring(0, 100)}...`);
        console.log(
          `   데이터:`,
          JSON.stringify(json, null, 2).substring(0, 3000)
        );
        console.log("   ---");
      } catch {
        console.log(`   ⚠️ 응답 파싱 실패`);
      }
    }
  });

  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
  await delay(2000);

  // DOM에서 링크 확인
  const links = await page.evaluate(() => {
    const result: string[] = [];
    document.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href") ?? "";
      if (href.includes("/restaurant/")) {
        result.push(href);
      }
    });
    return result;
  });

  console.log(`\n🔗 DOM에서 찾은 restaurant 링크: ${links.length}개`);
  for (const link of links.slice(0, 10)) {
    console.log(`   ${link}`);
  }

  // 전체 페이지 URL 확인 (리다이렉트 여부)
  console.log(`\n📍 최종 페이지 URL: ${page.url()}`);
  console.log(`📊 총 GraphQL 응답: ${responseCount}개`);

  await browser.close();
}

main().catch((err) => {
  console.error("오류:", err);
  process.exit(1);
});
