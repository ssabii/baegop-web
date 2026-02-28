"use client";

import { Shuffle, CircleQuestionMarkIcon, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { RandomCard } from "./random-card";
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
    <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col px-4">
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
          <div className="flex h-full items-center justify-center">
            <Empty className="border-none py-12">
              <EmptyHeader className="gap-1">
                <EmptyMedia
                  variant="icon"
                  className="size-12 rounded-none bg-transparent"
                >
                  <SearchX className="size-12 text-primary" />
                </EmptyMedia>
                <EmptyTitle className="font-bold">
                  조건에 맞는 장소가 없어요
                </EmptyTitle>
                <EmptyDescription>필터를 변경해 보세요</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Empty className="border-none py-12">
              <EmptyHeader className="gap-1">
                <EmptyMedia
                  variant="icon"
                  className="size-12 rounded-none bg-transparent"
                >
                  <CircleQuestionMarkIcon className="size-12 text-primary" />
                </EmptyMedia>
                <EmptyTitle className="font-bold">오늘 뭐 먹지?</EmptyTitle>
                <EmptyDescription>
                  랜덤 버튼을 누르면 장소를 추천해 드려요!
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4">
        <Button
          className="rounded-full size-12"
          onClick={spin}
          disabled={isSpinning || filteredPlaces.length === 0}
        >
          {isSpinning ? (
            <Spinner className="size-6" aria-label="로딩 중" />
          ) : (
            <Shuffle className="size-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
