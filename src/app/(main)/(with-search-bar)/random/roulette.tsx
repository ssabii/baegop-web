"use client";

import { useState } from "react";
import { RandomActions } from "./random-actions";
import { RandomContent } from "./random-content";
import { RandomFilter } from "./random-filter";
import { useRoulette } from "./use-roulette";
import type { RandomPlace } from "./types";

interface RouletteProps {
  places: RandomPlace[];
}

export function Roulette({ places }: RouletteProps) {
  const [filterOpen, setFilterOpen] = useState(false);
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
    <div className="mx-auto h-full w-full max-w-4xl">
      <RandomFilter
        open={filterOpen}
        onOpenChange={setFilterOpen}
        categories={categories}
        konaOnly={konaOnly}
        onApply={handleFilterApply}
        onRemoveCategory={handleRemoveCategory}
        onRemoveKona={handleRemoveKona}
      />

      <div className="flex-1 overflow-y-auto">
        <RandomContent
          result={result}
          isSpinning={isSpinning}
          hasPlaces={filteredPlaces.length > 0}
        />
      </div>

      <RandomActions
        onSpin={spin}
        onFilterOpen={() => setFilterOpen(true)}
        disabled={isSpinning || filteredPlaces.length === 0}
        isSpinning={isSpinning}
      />
    </div>
  );
}
