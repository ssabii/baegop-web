// 배곱 캡슐 기능 공용 상수 모음.
// 매직 넘버/색상/애니메이션 타이밍 등이 여러 파일에 중복되지 않도록 단일 진리의 원천(SSOT)을 둔다.

// 다이얼을 한 바퀴(360도) 돌리면 뽑기가 실행됨
export const SPIN_THRESHOLD_DEGREES = 360;

// 뽑기 연출 타이밍
export const SPINNING_DURATION_MS = 800;
export const DISPENSING_DURATION_MS = 1400;

// 한 세션당 뽑을 수 있는 최대 횟수 (첫 뽑기 + 리롤 2회)
export const MAX_ROLLS = 3;

// 기본 캡슐 색상 (초기 렌더링에서 잠깐 보이는 색)
export const INITIAL_CAPSULE_COLOR = "#FF6B35";

// 뽑기 결과로 나올 캡슐의 색상 후보
export const CAPSULE_COLORS = [
  "#FF6B35",
  "#F5C518",
  "#3B82F6",
  "#9B59B6",
  "#E05C3A",
];

// 페이지 배경 — 뽑기 단계는 따뜻한 그라데이션, 결과/상세 단계는 흰색
export const BACKGROUND = {
  warm: "linear-gradient(to bottom, #FFD4A8, #FFB87A, #FF9E5E)",
  white: "#ffffff",
} as const;
