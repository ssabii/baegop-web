import { describe, expect, it } from "vitest";
import {
  optimizeNaverImageUrl,
  optimizeSupabaseImageUrl,
  toOriginalSupabaseImageUrl,
} from "./image";

describe("optimizeNaverImageUrl", () => {
  it("네이버 이미지는 CDN 프리픽스로 감싼다", () => {
    const url = "https://ldb-phinf.pstatic.net/abc.jpg";
    const result = optimizeNaverImageUrl(url);
    expect(result).toContain("https://search.pstatic.net/common/");
    expect(result).toContain(encodeURIComponent(url));
  });

  it("이미 최적화된 네이버 URL은 그대로 둔다", () => {
    const already =
      "https://search.pstatic.net/common/?type=w560_sharpen&src=x";
    expect(optimizeNaverImageUrl(already)).toBe(already);
  });

  it("네이버 이미지가 아니면 그대로 둔다", () => {
    const url = "https://example.com/photo.jpg";
    expect(optimizeNaverImageUrl(url)).toBe(url);
  });
});

describe("optimizeSupabaseImageUrl", () => {
  it("public object URL을 render 변환 URL로 바꾸고 width 쿼리를 붙인다", () => {
    const url = "https://x.supabase.co/storage/v1/object/public/review/a.jpg";
    const result = optimizeSupabaseImageUrl(url);
    expect(result).toContain("/storage/v1/render/image/public/");
    expect(result).toContain("width=600");
    expect(result).toContain("resize=contain");
  });

  it("width 옵션을 반영한다", () => {
    const url = "https://x.supabase.co/storage/v1/object/public/review/a.jpg";
    expect(optimizeSupabaseImageUrl(url, { width: 200 })).toContain("width=200");
  });

  it("이미 render URL이면 그대로 둔다", () => {
    const url =
      "https://x.supabase.co/storage/v1/render/image/public/review/a.jpg";
    expect(optimizeSupabaseImageUrl(url)).toBe(url);
  });

  it("Supabase 스토리지 URL이 아니면 그대로 둔다", () => {
    const url = "https://example.com/a.jpg";
    expect(optimizeSupabaseImageUrl(url)).toBe(url);
  });
});

describe("toOriginalSupabaseImageUrl", () => {
  it("render URL을 원본 object URL로 되돌리고 쿼리를 제거한다", () => {
    const render =
      "https://x.supabase.co/storage/v1/render/image/public/review/a.jpg?width=600&resize=contain";
    expect(toOriginalSupabaseImageUrl(render)).toBe(
      "https://x.supabase.co/storage/v1/object/public/review/a.jpg",
    );
  });

  it("render URL이 아니면 그대로 둔다", () => {
    const url = "https://x.supabase.co/storage/v1/object/public/review/a.jpg";
    expect(toOriginalSupabaseImageUrl(url)).toBe(url);
  });

  it("optimize → toOriginal 왕복이 원본과 같다", () => {
    const original =
      "https://x.supabase.co/storage/v1/object/public/review/a.jpg";
    expect(toOriginalSupabaseImageUrl(optimizeSupabaseImageUrl(original))).toBe(
      original,
    );
  });
});
