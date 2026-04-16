export interface MockRestaurant {
  id: string;
  name: string;
  fullName: string;
  category: string;
  distanceText: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  description: string;
  fortuneMessage: string;
  address: string;
  phone: string;
  hours: string;
  imageUrl?: string;
}

export const MOCK_RESTAURANTS: MockRestaurant[] = [
  {
    id: "1",
    name: "신동궁감자탕",
    fullName: "신동궁감자탕 뼈숯불구이",
    category: "한식",
    distanceText: "내 위치에서 10분",
    rating: 4.5,
    reviewCount: 141,
    isOpen: false,
    description: "감자탕 국물로 더 깊은 맛 · 감자탕",
    fortuneMessage:
      "오늘 당신의 기운은 따뜻하고 든든한 것을 필요합니다. 도보 10분 거리에 지금, 사장님이 당신을 기다리고 있습니다.",
    address: "서울 강남구 테헤란로 123",
    phone: "02-555-1234",
    hours: "11:00 - 22:00 (브레이크 15:00 - 17:00)",
  },
  {
    id: "2",
    name: "명동교자",
    fullName: "명동교자 본점",
    category: "한식",
    distanceText: "내 위치에서 5분",
    rating: 4.3,
    reviewCount: 89,
    isOpen: true,
    description: "칼국수와 만두의 정석 · 칼국수",
    fortuneMessage:
      "담백하고 깔끔한 기운이 흐르는 하루입니다. 5분 거리의 이 가게가 오늘의 피로를 말끔히 씻어줄 것입니다.",
    address: "서울 중구 명동10길 29",
    phone: "02-776-5348",
    hours: "10:30 - 21:30",
  },
  {
    id: "3",
    name: "스시하나",
    fullName: "스시하나 오마카세",
    category: "일식",
    distanceText: "내 위치에서 7분",
    rating: 4.8,
    reviewCount: 203,
    isOpen: true,
    description: "신선한 제철 재료로 만드는 오마카세 · 초밥",
    fortuneMessage:
      "오늘은 특별한 경험을 추구하는 기운이 강합니다. 7분 거리의 이 공간이 당신의 하루를 빛낼 것입니다.",
    address: "서울 강남구 선릉로 456",
    phone: "02-333-7777",
    hours: "12:00 - 14:30, 18:00 - 22:00",
  },
  {
    id: "4",
    name: "홍콩반점0410",
    fullName: "홍콩반점0410 직영점",
    category: "중식",
    distanceText: "내 위치에서 3분",
    rating: 4.1,
    reviewCount: 67,
    isOpen: true,
    description: "얼큰하고 진한 짬뽕의 맛 · 중식",
    fortuneMessage:
      "강한 기운이 필요한 오늘, 불의 기운을 담은 이 음식이 당신에게 새로운 에너지를 불어넣어 줄 것입니다.",
    address: "서울 강남구 역삼로 789",
    phone: "02-123-4567",
    hours: "10:30 - 22:00",
  },
];

// 오늘 날짜를 시드로 사용하여 같은 날에는 동일한 식당이 나오도록 함
function getDateSeed(offset = 0): number {
  const today = new Date();
  return (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate() +
    offset
  );
}

export function getDailyRestaurant(): MockRestaurant {
  const index = getDateSeed() % MOCK_RESTAURANTS.length;
  return MOCK_RESTAURANTS[index];
}

export function getAlternativeRestaurant(
  excludeIds: string[],
  rollIndex: number,
): MockRestaurant {
  const candidates = MOCK_RESTAURANTS.filter(
    (restaurant) => !excludeIds.includes(restaurant.id),
  );

  // 모든 식당이 제외된 경우 첫 번째 식당을 반환 (안전장치)
  if (candidates.length === 0) return MOCK_RESTAURANTS[0];

  const index = getDateSeed(rollIndex * 7) % candidates.length;
  return candidates[index];
}
