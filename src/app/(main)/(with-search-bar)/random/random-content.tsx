import { cn } from "@/lib/utils";
import { RandomCard } from "./random-card";
import { RandomEmptyInitial, RandomEmptyNoResults } from "./random-empty";
import type { RandomPlace } from "./types";

interface RandomContentProps {
  result: RandomPlace | null;
  isSpinning: boolean;
  hasPlaces: boolean;
}

export function RandomContent({
  result,
  isSpinning,
  hasPlaces,
}: RandomContentProps) {
  if (result) {
    return (
      <div
        className={cn("transition-all duration-300", {
          "scale-95 opacity-50": isSpinning,
          "scale-100 opacity-100": !isSpinning,
        })}
      >
        <RandomCard place={result} />
      </div>
    );
  }

  if (!hasPlaces) {
    return <RandomEmptyNoResults />;
  }

  return <RandomEmptyInitial />;
}
