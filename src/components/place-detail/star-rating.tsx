import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn("size-3.5", {
            "fill-yellow-400 text-yellow-400": star <= rating,
            "text-muted-foreground/30": star > rating,
          })}
        />
      ))}
    </div>
  );
}
