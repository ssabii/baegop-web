"use client";

import { useState, useCallback, useMemo } from "react";
import { Shuffle, CircleQuestionMarkIcon, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { matchesCategory } from "@/lib/category";
import { type CategoryFilter } from "@/lib/constants";
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

interface PlaceData {
  id: string;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  image_urls: string[] | null;
  avg_rating: number | null;
  review_count: number;
  walking_minutes: number | null;
}

interface RouletteProps {
  places: PlaceData[];
}

export function Roulette({ places }: RouletteProps) {
  const [result, setResult] = useState<PlaceData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [konaOnly, setKonaOnly] = useState(false);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // 카테고리 필터 (0개 선택 시 전체)
      if (categories.length > 0) {
        const matchesAny = categories.some((cat) =>
          matchesCategory(place.category, cat),
        );
        if (!matchesAny) return false;
      }

      // 코나카드 필터
      if (konaOnly && place.kona_card_status !== "available") {
        return false;
      }

      return true;
    });
  }, [places, categories, konaOnly]);

  const spin = useCallback(() => {
    if (filteredPlaces.length === 0) return;

    setIsSpinning(true);

    // Fisher-Yates 셔플로 애니메이션 순서 결정
    const shuffled = [...filteredPlaces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 최종 결과가 이전 결과와 같으면 다른 장소로 교체
    const finalIndex = shuffled.length - 1;
    if (shuffled[finalIndex].id === result?.id && shuffled.length > 1) {
      [shuffled[finalIndex], shuffled[0]] = [shuffled[0], shuffled[finalIndex]];
    }

    const totalTicks = Math.min(shuffled.length, 15);
    let count = 0;
    const interval = setInterval(() => {
      setResult(shuffled[count % shuffled.length]);
      count++;

      if (count >= totalTicks) {
        clearInterval(interval);
        setResult(shuffled[finalIndex]);
        setIsSpinning(false);
      }
    }, 100);
  }, [filteredPlaces, result]);

  function handleFilterApply(
    newCategories: CategoryFilter[],
    newKonaOnly: boolean,
  ) {
    setCategories(newCategories);
    setKonaOnly(newKonaOnly);
    setResult(null);
  }

  function handleRemoveCategory(category: CategoryFilter) {
    const newCategories = categories.filter((c) => c !== category);
    setCategories(newCategories);
    setResult(null);
  }

  function handleRemoveKona() {
    setKonaOnly(false);
    setResult(null);
  }

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
                <EmptyDescription>
                  필터를 변경해 보세요
                </EmptyDescription>
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
