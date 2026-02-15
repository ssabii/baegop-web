export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function extractNaverPlaceId(link: string): string | undefined {
  const match = link.match(/place\/(\d+)/);
  return match?.[1];
}

export function convertNaverCoord(value: string): number {
  return parseInt(value, 10) / 10_000_000;
}

export function buildNaverMapLink(name: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(name)}`;
}

export async function fetchNaverImages(query: string): Promise<string[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) return [];

  try {
    const url = new URL("https://openapi.naver.com/v1/search/image");
    url.searchParams.set("query", query);
    url.searchParams.set("display", "3");
    url.searchParams.set("sort", "sim");

    const res = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as {
      items: { link: string }[];
    };

    return data.items.map((item) => item.link);
  } catch {
    return [];
  }
}
