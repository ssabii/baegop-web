/**
 * 메뉴 DOM 구조 디버그
 */

import puppeteer from "puppeteer";

const placeId = process.argv[2] ?? "36924806";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const menuUrl = `https://m.place.naver.com/restaurant/${placeId}/menu/list`;
  console.log(`🔍 ${menuUrl}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  );

  await page.goto(menuUrl, { waitUntil: "networkidle2", timeout: 30000 });
  await delay(3000);

  // 가격 패턴이 있는 요소와 그 부모 구조 분석
  const analysis = await page.evaluate(() => {
    const results: string[] = [];

    // 가격 패턴 (숫자+원)을 포함하는 모든 요소 찾기
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const priceNodes: Node[] = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && /[\d,]+원/.test(node.textContent.trim())) {
        priceNodes.push(node);
      }
    }

    for (const pNode of priceNodes.slice(0, 8)) {
      const el = pNode.parentElement;
      if (!el) continue;

      // 부모 체인 분석
      const chain: string[] = [];
      let current: HTMLElement | null = el;
      for (let i = 0; i < 5 && current; i++) {
        const tag = current.tagName.toLowerCase();
        const cls = typeof current.className === "string" ? current.className : "";
        chain.push(`${tag}.${cls.split(" ")[0] || "(no-class)"}`);
        current = current.parentElement;
      }

      // 형제/이웃 텍스트 확인
      const parent = el.parentElement;
      const parentText = parent?.innerText?.substring(0, 200) ?? "";

      results.push(
        `가격: "${pNode.textContent?.trim()}"\n` +
          `  체인: ${chain.join(" → ")}\n` +
          `  부모 텍스트: ${parentText.replace(/\n/g, " | ")}\n`
      );
    }

    // 메뉴 리스트 컨테이너 후보 찾기
    // "대표" 또는 메뉴명 + 가격이 같이 있는 li/div 찾기
    const listItems = document.querySelectorAll("li");
    const menuLis: string[] = [];
    listItems.forEach((li) => {
      const text = li.innerText ?? "";
      if (/[\d,]+원/.test(text) && text.length < 200) {
        const tag = li.tagName.toLowerCase();
        const cls = typeof li.className === "string" ? li.className : "";
        const parentCls =
          typeof li.parentElement?.className === "string"
            ? li.parentElement.className
            : "";
        menuLis.push(
          `<${tag} class="${cls.split(" ")[0]}"> parent=<${li.parentElement?.tagName.toLowerCase()} class="${parentCls.split(" ")[0]}"> → "${text.replace(/\n/g, " | ").substring(0, 150)}"`
        );
      }
    });

    return {
      priceAnalysis: results,
      menuListItems: menuLis.slice(0, 10),
    };
  });

  console.log("=== 가격 요소 분석 ===\n");
  for (const a of analysis.priceAnalysis) {
    console.log(a);
  }

  console.log("\n=== 메뉴 li 요소 ===\n");
  for (const li of analysis.menuListItems) {
    console.log(li);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("오류:", err);
  process.exit(1);
});
