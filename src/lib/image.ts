const NAVER_CDN_PREFIX = "https://search.pstatic.net/common/?autoRotate=true&type=w560_sharpen&src=";

function isNaverImageUrl(url: string): boolean {
  return url.includes("pstatic.net") || url.includes("naver.net");
}

function isAlreadyOptimizedNaverUrl(url: string): boolean {
  return url.startsWith("https://search.pstatic.net/common/");
}

export function optimizeNaverImageUrl(url: string): string {
  if (!isNaverImageUrl(url) || isAlreadyOptimizedNaverUrl(url)) return url;
  return NAVER_CDN_PREFIX + encodeURIComponent(url);
}

export function optimizeNaverImageUrls(urls: string[]): string[] {
  return urls.map(optimizeNaverImageUrl);
}

export function optimizeSupabaseImageUrl(
  url: string,
  { width = 600 }: { width?: number } = {},
): string {
  if (!url.includes("/storage/v1/object/public/")) return url;
  if (url.includes("/storage/v1/render/image/public/")) return url;
  return url.replace(
    "/storage/v1/object/public/",
    `/storage/v1/render/image/public/`,
  ) + `?width=${width}&resize=contain`;
}

export async function compressImage(file: File): Promise<File> {
  const imageCompression = (await import("browser-image-compression")).default;
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    initialQuality: 0.7,
    useWebWorker: true,
  });
}

export function toOriginalSupabaseImageUrl(url: string): string {
  if (!url.includes("/storage/v1/render/image/public/")) return url;
  const withoutRender = url.replace(
    "/storage/v1/render/image/public/",
    "/storage/v1/object/public/",
  );
  return withoutRender.split("?")[0];
}
