"use client";

import { MessageSquarePlus } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReviewCard } from "./review-card";

interface ReviewData {
  id: number;
  rating: number;
  content: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
  review_images: {
    url: string;
    display_order: number;
  }[];
}

interface ReviewSectionProps {
  naverPlaceId: string;
  reviews: ReviewData[];
  currentUserId: string | null;
}

export function ReviewSection({
  naverPlaceId,
  reviews,
  currentUserId,
}: ReviewSectionProps) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <Empty className="border-none py-12">
          <EmptyHeader className="gap-1">
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-none bg-transparent"
            >
              <MessageSquarePlus className="size-12 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">
              아직 리뷰가 없습니다
            </EmptyTitle>
            <EmptyDescription>첫 번째 리뷰를 남겨보세요!</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="divide-y">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={currentUserId === review.user_id}
              naverPlaceId={naverPlaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
