import type { KonaCardStatus } from "@/types";

export const KONA_CARD_LABELS: Record<KonaCardStatus, string> = {
  available: "코나카드 가능",
  unavailable: "코나카드 불가",
  unknown: "미확인",
};

// 코나카드 투표 임계값은 DB app_config 테이블에서 관리 (key: 'kona_vote_threshold')

// 크몽 사무실 좌표 (서울 강남구 테헤란로)
export const COMPANY_LOCATION = {
  lat: 37.4924644,
  lng: 127.0268075,
  postalCode: "06625",
} as const;
