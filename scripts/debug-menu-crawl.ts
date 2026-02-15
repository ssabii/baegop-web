/**
 * 네이버 플레이스 메뉴 크롤링 디버그 스크립트
 */

import puppeteer from "puppeteer";

const placeId = process.argv[2] ?? "36924806"; // 하남돼지집 역삼점

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const menuUrl = `https://m.place.naver.com/restaurant/${placeId}/menu/list`;
  console.log(`🔍 메뉴 URL: ${menuUrl}\n`);

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

    if (url.includes("place.naver.com/graphql")) {
      responseCount++;
      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.includes("json")) return;

      try {
        const json = await response.json();
        const text = JSON.stringify(json, null, 2);
        console.log(`\n📦 GraphQL 응답 #${responseCount}`);
        console.log(`   URL: ${url.substring(0, 120)}...`);

        // 메뉴 관련 키워드가 포함된 응답만 자세히 출력
        if (
          text.includes("menu") ||
          text.includes("Menu") ||
          text.includes("price") ||
          text.includes("Price")
        ) {
          console.log(`   🍽️  메뉴 관련 데이터 발견!`);
          console.log(text.substring(0, 5000));
        } else {
          // 최상위 키만 출력
          const responses = Array.isArray(json) ? json : [json];
          for (const resp of responses) {
            const dataKeys = resp?.data
              ? Object.keys(resp.data)
              : ["(no data)"];
            console.log(`   키: ${dataKeys.join(", ")}`);
          }
        }
        console.log("   ---");
      } catch {
        console.log(`   ⚠️ 응답 파싱 실패`);
      }
    }
  });

  await page.goto(menuUrl, { waitUntil: "networkidle2", timeout: 30000 });
  await delay(3000);

  // DOM 구조 확인
  const domInfo = await page.evaluate(() => {
    const body = document.body.innerText.substring(0, 2000);
    const menuElements = document.querySelectorAll(
      '[class*="menu"], [class*="Menu"]'
    );
    const classes: string[] = [];
    menuElements.forEach((el) => {
      const cn = typeof el.className === "string" ? el.className : "";
      if (cn) classes.push(cn.substring(0, 100));
    });
    return { bodyPreview: body, menuClasses: classes.slice(0, 20) };
  });

  console.log(`\n📍 최종 URL: ${page.url()}`);
  console.log(`📊 총 GraphQL 응답: ${responseCount}개`);
  console.log(`\n📄 페이지 텍스트 미리보기:\n${domInfo.bodyPreview}`);
  console.log(
    `\n🎯 메뉴 관련 클래스:\n${domInfo.menuClasses.join("\n") || "(없음)"}`
  );

  await browser.close();
}

main().catch((err) => {
  console.error("오류:", err);
  process.exit(1);
});
