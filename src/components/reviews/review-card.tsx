import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { formatRelativeDate } from "@/lib/date";

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    content: string | null;
    created_at: string | null;
    place: {
      id: string;
      name: string;
    } | null;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const content = (
    <div className="space-y-1 py-3">
      <div className="flex items-center gap-1">
        <span className="truncate text-sm font-semibold">
          {review.place?.name ?? "알 수 없는 장소"}
        </span>
        {review.place && (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`size-3.5 ${
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        {review.created_at && (
          <span className="text-xs text-muted-foreground/60">
            {formatRelativeDate(review.created_at)}
          </span>
        )}
      </div>
      {review.content && (
        <p className="line-clamp-2 text-sm text-secondary-foreground">
          {review.content}
        </p>
      )}
    </div>
  );

  if (review.place) {
    return (
      <Link href={`/places/${review.place.id}`} className="block rounded-xl p-3 -m-3 transition-colors hover:bg-accent">
        {content}
      </Link>
    );
  }

  return content;
}
