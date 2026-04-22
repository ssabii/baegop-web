"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingPickerProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingPicker({
  value,
  onChange,
  disabled = false,
}: StarRatingPickerProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="mt-2 flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <Star
            className={`size-7 ${
              star <= (hover || value)
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
