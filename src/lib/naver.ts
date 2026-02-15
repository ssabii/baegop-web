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
