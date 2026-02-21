import type { KonaCardStatus } from "@/types";

export const KONA_CARD_LABELS: Record<KonaCardStatus, string> = {
  available: "코나카드 가능",
  unavailable: "코나카드 불가",
  unknown: "미확인",
};

// 코나카드 투표 임계값은 DB app_config 테이블에서 관리 (key: 'kona_vote_threshold')

// 인기 장소 기준
export const POPULAR_RATING_THRESHOLD = 4.3;
export const POPULAR_MIN_REVIEW_COUNT = 3;

// 최근 장소 기준 일수
export const RECENT_DAYS = 7;

// 비밀번호 유효성 규칙
export const PASSWORD_MIN_LENGTH =
  process.env.NODE_ENV === "production" ? 8 : 6;
export const PASSWORD_REQUIRES_MIX =
  process.env.NODE_ENV === "production";

// PostgreSQL 에러 코드
export const PG_UNIQUE_VIOLATION = "23505";

// 크몽 사무실 좌표 (서울 강남구 테헤란로)
export const COMPANY_LOCATION = {
  lat: 37.4924644,
  lng: 127.0268075,
  postalCode: "06625",
} as const;
