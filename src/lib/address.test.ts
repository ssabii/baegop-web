import { describe, expect, it } from "vitest";
import { formatShortAddress } from "./address";

describe("formatShortAddress", () => {
  it("빈 문자열은 그대로", () => {
    expect(formatShortAddress("")).toBe("");
  });

  it("시/도 약어 변환 + 마지막 번지 제거", () => {
    expect(formatShortAddress("경기도 성남시 분당구 불정로 6")).toBe(
      "경기 성남시 분당구 불정로",
    );
    expect(formatShortAddress("서울특별시 중구 세종대로 110")).toBe(
      "서울 중구 세종대로",
    );
  });

  it("마지막이 숫자가 아니면 제거하지 않음", () => {
    expect(formatShortAddress("서울특별시 중구 세종대로")).toBe(
      "서울 중구 세종대로",
    );
  });

  it("약어 테이블에 없는 시/도는 원본 유지", () => {
    expect(formatShortAddress("제주시 첨단로 242")).toBe("제주시 첨단로");
  });

  it("2단어 이하이면 번지 제거를 하지 않음", () => {
    expect(formatShortAddress("서울특별시 110")).toBe("서울 110");
  });
});
