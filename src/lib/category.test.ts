import { describe, expect, it } from "vitest";
import { matchesCategory } from "./category";

describe("matchesCategory", () => {
  it("null 카테고리는 항상 false", () => {
    expect(matchesCategory(null, "한식")).toBe(false);
  });

  it("네이버 카테고리 문자열에 키워드가 포함되면 true", () => {
    expect(matchesCategory("음식점>한식>국밥", "한식")).toBe(true);
    expect(matchesCategory("음식점>중식>중화요리", "중식")).toBe(true);
    expect(matchesCategory("카페,디저트>커피전문점", "카페")).toBe(true);
  });

  it("해당 필터의 키워드가 없으면 false", () => {
    expect(matchesCategory("음식점>한식>국밥", "일식")).toBe(false);
  });

  it("대소문자를 구분하지 않는다", () => {
    expect(matchesCategory("Restaurant>BBQ", "양식")).toBe(true);
  });
});
