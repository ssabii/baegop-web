import type { KonaCardStatus } from "@/types";

export const KONA_CARD_LABELS: Record<KonaCardStatus, string> = {
  available: "코나카드 가능",
  unavailable: "코나카드 불가",
  unknown: "미확인",
};

export const KONA_VOTE_THRESHOLD = 3;

// 크몽 사무실 좌표 (서울 강남구 테헤란로)
export const COMPANY_LOCATION = {
  lat: 37.5058,
  lng: 127.0396,
  postalCode: "06625",
} as const;
