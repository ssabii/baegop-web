import type { Tables } from "./database";

// DB 테이블 타입 (자동 생성 기반)
export type Profile = Tables<"profiles">;
export type Place = Tables<"places">;
export type Review = Tables<"reviews">;
export type ReviewImage = Tables<"review_images">;
export type Reaction = Tables<"reactions">;
export type KonaPostalCode = Tables<"kona_postal_codes">;

// 릴레이션 포함 타입 (JOIN 조회용)
export type PlaceWithProfile = Place & {
  profile?: Profile;
};

export type ReviewWithProfile = Review & {
  profile?: Profile;
  images?: ReviewImage[];
};

// 리터럴 타입 (DB에서 text로 저장되지만 앱에서는 좁은 타입으로 사용)
export type KonaCardStatus = "available" | "unavailable" | "unknown";
export type KonaVote = "available" | "unavailable";

// 비DB 타입 — 네이버 플레이스 GraphQL 검색 결과 (places 쿼리)
export interface NaverSearchResult {
  id: string; // naver place ID
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string | null;
  x: string; // longitude
  y: string; // latitude
  imageUrl: string | null;
  menus: string[]; // ["메뉴명 가격", ...]
}

// 네이버 플레이스 상세 (placeDetail 쿼리)
export interface NaverPlaceDetail {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string | null;
  x: string;
  y: string;
  imageUrls: string[];
  menus: NaverPlaceMenu[];
}

export interface NaverPlaceMenu {
  name: string;
  price: string | null;
  images: string[];
  description: string | null;
  recommend: boolean;
}
