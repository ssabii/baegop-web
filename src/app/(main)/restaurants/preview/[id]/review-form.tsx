"use client";

import { useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createRestaurantWithReview } from "@/app/(main)/actions";
import type { NaverPlaceDetail } from "@/types";

export function ReviewForm({ placeDetail }: { placeDetail: NaverPlaceDetail }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === 0) return;

    startTransition(async () => {
      await createRestaurantWithReview(placeDetail, {
        rating,
        content,
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* 별점 */}
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

      {/* 리뷰 내용 */}
      <div>
        <Label htmlFor="content" className="text-sm font-medium">
          리뷰 내용
        </Label>
        <Textarea
          id="content"
          placeholder="맛, 분위기, 서비스 등 자유롭게 작성해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-2"
          rows={4}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isPending}
        className="gap-2"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        리뷰 작성 및 맛집 등록
      </Button>
    </div>
  );
}
