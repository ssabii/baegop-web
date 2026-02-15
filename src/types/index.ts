import type { Tables } from "./database";

// DB 테이블 타입 (자동 생성 기반)
export type Profile = Tables<"profiles">;
export type Restaurant = Tables<"restaurants">;
export type Review = Tables<"reviews">;
export type ReviewImage = Tables<"review_images">;
export type Reaction = Tables<"reactions">;
export type RestaurantMenu = Tables<"restaurant_menus">;
export type KonaCardVote = Tables<"kona_card_votes">;
export type KonaPostalCode = Tables<"kona_postal_codes">;

// 릴레이션 포함 타입 (JOIN 조회용)
export type RestaurantWithProfile = Restaurant & {
  profile?: Profile;
};

export type ReviewWithProfile = Review & {
  profile?: Profile;
  images?: ReviewImage[];
};

// 리터럴 타입 (DB에서 text로 저장되지만 앱에서는 좁은 타입으로 사용)
export type KonaCardStatus = "available" | "unavailable" | "unknown";
export type ReactionType = "like" | "dislike";
export type KonaVote = "available" | "unavailable";

// 비DB 타입
export interface NaverSearchResult {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
  imageUrls?: string[];
}
