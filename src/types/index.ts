export type KonaCardStatus = "available" | "unavailable" | "unknown";

export type ReactionType = "like" | "dislike";

export type KonaVote = "available" | "unavailable";

export interface Profile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  category: string;
  address: string;
  postal_code: string | null;
  lat: number;
  lng: number;
  naver_place_id: string | null;
  description: string | null;
  kona_card_status: KonaCardStatus;
  like_count: number;
  dislike_count: number;
  created_by: string;
  profile?: Profile;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  restaurant_id: number;
  user_id: string;
  profile?: Profile;
  rating: number;
  content: string | null;
  images?: ReviewImage[];
  created_at: string;
  updated_at: string;
}

export interface ReviewImage {
  id: number;
  review_id: number;
  url: string;
  display_order: number;
  created_at: string;
}

export interface Reaction {
  id: number;
  restaurant_id: number;
  user_id: string;
  type: ReactionType;
  created_at: string;
}

export interface KonaCardVote {
  id: number;
  restaurant_id: number;
  user_id: string;
  vote: KonaVote;
  created_at: string;
}

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
}
