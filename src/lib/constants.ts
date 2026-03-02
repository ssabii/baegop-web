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
export const PASSWORD_REQUIRES_MIX = process.env.NODE_ENV === "production";

// PostgreSQL 에러 코드
export const PG_UNIQUE_VIOLATION = "23505";

// 카테고리 필터
export const CATEGORY_FILTERS = [
  "한식",
  "중식",
  "일식",
  "양식",
  "패스트푸드",
  "카페",
] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export const CATEGORY_KEYWORDS: Record<CategoryFilter, string[]> = {
  한식: [
    "한식", "한정식", "국밥", "소고기", "돼지고기", "삼겹살", "갈비",
    "국수", "칼국수", "수제비", "곰탕", "설렁탕", "백숙", "삼계탕",
    "고기", "쭈꾸미", "감자탕", "순대", "족발", "보쌈",
    "찌개", "전골", "불고기", "닭갈비", "닭볶음", "찜닭", "떡갈비",
    "비빔밥", "백반", "정식", "쌈밥", "죽",
    "냉면", "밀면", "막국수",
    "해물", "조개", "아귀", "대게", "꽃게",
    "생선", "장어", "추어탕", "매운탕", "민물",
    "두부", "청국장", "부대찌개",
    "곱창", "막창", "대창",
    "오리", "닭요리",
    "분식", "떡볶이", "김밥", "만두", "어묵",
    "해장국", "선지", "뼈해장", "내장탕",
    "샤브샤브", "전복", "한우",
    "회", "횟집", "물회",
    "숯불", "화로", "연탄",
    "닭발", "낙지", "주꾸미",
    "솥밥", "보리밥", "산채", "영양밥",
    "아구찜", "해물찜", "갈비찜",
    "파전", "빈대떡", "부침",
  ],
  중식: [
    "중식", "중화", "중국",
    "짜장", "짬뽕", "탕수육", "양장피",
    "마라", "훠궈", "사천",
    "양꼬치",
    "딤섬", "샤오롱바오",
    "볶음밥", "유린기", "깐풍", "꿔바로우",
    "울면", "동파육",
    "팔보채", "라조기", "깐쇼",
    "도삭면", "마파두부",
  ],
  일식: [
    "일식", "일본",
    "초밥", "스시", "오마카세",
    "라멘", "츠케멘",
    "돈카츠", "돈까스", "카츠",
    "우동", "소바", "메밀",
    "이자카야",
    "야키토리",
    "카레",
    "텐푸라", "텐동",
    "타코야끼", "오코노미야끼",
    "사시미",
    "스키야키", "규동",
  ],
  양식: [
    "양식",
    "파스타", "스파게티", "리조또",
    "피자", "화덕",
    "스테이크",
    "브런치",
    "샐러드", "샌드위치",
    "프렌치", "비스트로",
    "이탈리아",
    "멕시칸", "타코", "부리또",
    "바베큐", "BBQ",
    "다이닝", "파인다이닝",
    "레스토랑",
  ],
  패스트푸드: [
    "패스트푸드",
    "수제버거", "햄버거",
    "샌드위치",
    "핫도그",
    "치킨",
  ],
  카페: [
    "카페", "커피", "디저트", "베이커리", "빵", "케이크",
    "음료", "주스", "스무디", "아이스크림",
    "마카롱", "와플", "도넛",
  ],
};

// 크몽 사무실 좌표
export const COMPANY_LOCATION = {
  name: "크몽",
  placeId: "35734647",
  lat: 37.4924644,
  lng: 127.0268075,
  postalCode: "06625",
} as const;
