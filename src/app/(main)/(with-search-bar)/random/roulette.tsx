"use client";

import { cn } from "@/lib/utils";
import { RandomActions } from "./random-actions";
import { RandomCard } from "./random-card";
import { RandomEmptyInitial, RandomEmptyNoResults } from "./random-empty";
import { RandomFilter } from "./random-filter";
import { useRoulette } from "./use-roulette";
import type { RandomPlace } from "./types";

interface RouletteProps {
  places: RandomPlace[];
}

export function Roulette({ places }: RouletteProps) {
  const {
    result,
    isSpinning,
    categories,
    konaOnly,
    filteredPlaces,
    spin,
    handleFilterApply,
    handleRemoveCategory,
    handleRemoveKona,
  } = useRoulette(places);

  return (
    <div className="relative mx-auto h-full w-full max-w-4xl">
      <RandomFilter
        categories={categories}
        konaOnly={konaOnly}
        onApply={handleFilterApply}
        onRemoveCategory={handleRemoveCategory}
        onRemoveKona={handleRemoveKona}
      />

      <div className="flex-1 overflow-y-auto">
        {result ? (
          <div
            className={cn("transition-all duration-300", {
              "scale-95 opacity-50": isSpinning,
              "scale-100 opacity-100": !isSpinning,
            })}
          >
            <RandomCard place={result} />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <RandomEmptyNoResults />
        ) : (
          <RandomEmptyInitial />
        )}
      </div>

      <RandomActions
        onSpin={spin}
        disabled={isSpinning || filteredPlaces.length === 0}
        isSpinning={isSpinning}
      />
    </div>
  );
}
