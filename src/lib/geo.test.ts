import { describe, expect, it } from "vitest";
import {
  calculateDistance,
  estimateWalkingMinutes,
  formatDistance,
  formatWalkingDuration,
} from "./geo";

describe("calculateDistance", () => {
  it("동일 좌표는 0m", () => {
    const p = { lat: 37.5, lng: 127 };
    expect(calculateDistance(p, p)).toBe(0);
  });

  it("위도 1도 차이는 약 111km", () => {
    const d = calculateDistance(
      { lat: 37, lng: 127 },
      { lat: 38, lng: 127 },
    );
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it("방향에 무관하게 대칭", () => {
    const a = { lat: 37.4924644, lng: 127.0268075 };
    const b = { lat: 37.5666805, lng: 126.9784147 };
    expect(calculateDistance(a, b)).toBeCloseTo(calculateDistance(b, a), 5);
  });
});

describe("estimateWalkingMinutes", () => {
  it("80m/min 기준으로 반올림", () => {
    expect(estimateWalkingMinutes(80)).toBe(1);
    expect(estimateWalkingMinutes(800)).toBe(10);
    expect(estimateWalkingMinutes(120)).toBe(2); // 1.5 → 2
    expect(estimateWalkingMinutes(0)).toBe(0);
  });
});

describe("formatDistance", () => {
  it("1000m 미만은 m 단위 (천단위 콤마)", () => {
    expect(formatDistance(0)).toBe("0m");
    expect(formatDistance(512)).toBe("512m");
    expect(formatDistance(512.6)).toBe("513m");
    expect(formatDistance(999)).toBe("999m");
  });

  it("1000m 이상은 km 단위 (소수 1자리)", () => {
    expect(formatDistance(1000)).toBe("1.0km");
    expect(formatDistance(1234)).toBe("1.2km");
    expect(formatDistance(12345)).toBe("12.3km");
  });
});

describe("formatWalkingDuration", () => {
  it("0분은 '근처'", () => {
    expect(formatWalkingDuration(0)).toBe("근처");
  });

  it("30분 이상은 '30분 이상'", () => {
    expect(formatWalkingDuration(30)).toBe("30분 이상");
    expect(formatWalkingDuration(100)).toBe("30분 이상");
  });

  it("1~29분은 분 단위", () => {
    expect(formatWalkingDuration(5)).toBe("5분");
    expect(formatWalkingDuration(29)).toBe("29분");
  });
});
