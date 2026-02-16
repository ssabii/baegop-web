"use client";

import { useState, useTransition } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createReview, deleteReview } from "./actions";

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
}

interface ReviewSectionProps {
  placeId: number;
  reviews: ReviewData[];
  currentUserId: string | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${
            star <= rating
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  isOwner,
  placeId,
}: {
  review: ReviewData;
  isOwner: boolean;
  placeId: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteReview(review.id, placeId);
    });
  }

  const nickname = review.profiles?.nickname ?? "익명";

  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={review.profiles?.avatar_url ?? undefined} />
        <AvatarFallback>{nickname[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{nickname}</span>
            <StarRating rating={review.rating} />
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
        {review.content && (
          <p className="text-sm text-muted-foreground">{review.content}</p>
        )}
        <p className="text-xs text-muted-foreground/60">
          {new Date(review.created_at).toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}

function ReviewForm({ placeId }: { placeId: number }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === 0) return;

    startTransition(async () => {
      await createReview(placeId, { rating, content });
      setRating(0);
      setContent("");
    });
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <Label className="text-sm font-medium">별점</Label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-colors"
            >
              <Star
                className={`size-7 ${
                  star <= (hoverRating || rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review-content" className="text-sm font-medium">
          리뷰 내용
        </Label>
        <Textarea
          id="review-content"
          placeholder="맛, 분위기, 서비스 등 자유롭게 작성해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-2"
          rows={3}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isPending}
        size="sm"
        className="gap-2"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        리뷰 작성
      </Button>
    </div>
  );
}

export function ReviewSection({
  placeId,
  reviews,
  currentUserId,
}: ReviewSectionProps) {
  return (
    <div className="space-y-4">
      {currentUserId && <ReviewForm placeId={placeId} />}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={currentUserId === review.user_id}
              placeId={placeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
