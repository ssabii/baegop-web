import {
  FEEDBACK_CATEGORIES,
  MAX_FEEDBACK_CONTENT_LENGTH,
  MAX_FEEDBACK_IMAGES,
  MAX_REVIEW_CONTENT_LENGTH,
  MAX_REVIEW_IMAGES,
  MAX_REVIEW_RATING,
  MIN_FEEDBACK_CONTENT_LENGTH,
  MIN_REVIEW_RATING,
} from "@/lib/constants";
import type { FeedbackCategory } from "@/types";

/**
 * 서버 액션용 리뷰 입력 검증. 클라이언트 UI 제약을 우회한 직접 호출에 대비한다.
 * 검증 실패 시 사용자 대면 메시지를 담은 Error를 throw한다.
 */
export function assertValidReviewInput(
  data: { rating: number; content: string },
  imageCount = 0,
) {
  if (
    !Number.isInteger(data.rating) ||
    data.rating < MIN_REVIEW_RATING ||
    data.rating > MAX_REVIEW_RATING
  ) {
    throw new Error(
      `별점은 ${MIN_REVIEW_RATING}~${MAX_REVIEW_RATING} 사이여야 해요`,
    );
  }
  if (data.content.length > MAX_REVIEW_CONTENT_LENGTH) {
    throw new Error(`리뷰는 ${MAX_REVIEW_CONTENT_LENGTH}자 이하로 작성해주세요`);
  }
  if (imageCount > MAX_REVIEW_IMAGES) {
    throw new Error(`이미지는 최대 ${MAX_REVIEW_IMAGES}장까지 첨부할 수 있어요`);
  }
}

/**
 * 서버 액션용 피드백 입력 검증. category enum과 content 길이를 서버에서 강제한다.
 */
export function assertValidFeedbackInput(
  data: { category: FeedbackCategory; content: string },
  imageCount = 0,
) {
  if (!FEEDBACK_CATEGORIES.includes(data.category)) {
    throw new Error("올바르지 않은 피드백 유형이에요");
  }
  const content = data.content.trim();
  if (content.length < MIN_FEEDBACK_CONTENT_LENGTH) {
    throw new Error(
      `피드백은 ${MIN_FEEDBACK_CONTENT_LENGTH}자 이상 작성해주세요`,
    );
  }
  if (content.length > MAX_FEEDBACK_CONTENT_LENGTH) {
    throw new Error(
      `피드백은 ${MAX_FEEDBACK_CONTENT_LENGTH}자 이하로 작성해주세요`,
    );
  }
  if (imageCount > MAX_FEEDBACK_IMAGES) {
    throw new Error(`이미지는 최대 ${MAX_FEEDBACK_IMAGES}장까지 첨부할 수 있어요`);
  }
}
