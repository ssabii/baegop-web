"use client";

import { useState, useCallback } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlaceCard } from "@/components/places";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { CircleQuestionMarkIcon } from "lucide-react";

interface PlaceData {
  id: string;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  image_urls: string[] | null;
  avg_rating: number | null;
  review_count: number;
}

interface RouletteProps {
  places: PlaceData[];
}

export function Roulette({ places }: RouletteProps) {
  const [result, setResult] = useState<PlaceData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = useCallback(() => {
    if (places.length === 0) return;

    setIsSpinning(true);

    let count = 0;
    const totalTicks = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * places.length);
      setResult(places[randomIndex]);
      count++;

      if (count >= totalTicks) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * places.length);
        setResult(places[finalIndex]);
        setIsSpinning(false);
      }
    }, 100);
  }, [places]);

  return (
    <div className="w-full h-full relative flex items-center justify-center px-4">
      {result ? (
        <div
          className={cn("w-full transition-all duration-300", {
            "scale-95 opacity-50": isSpinning,
            "scale-100 opacity-100": !isSpinning,
          })}
        >
          <PlaceCard place={result} />
        </div>
      ) : (
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
              랜덤 버튼을 누르면 장소를 추천해 드릴게요!
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {result && (
          <Button
            variant="secondary"
            className="rounded-full size-12 bg-muted"
            onClick={() => setResult(null)}
            disabled={isSpinning}
          >
            <RotateCcw className="size-6" />
          </Button>
        )}
        <Button
          className="rounded-full size-12"
          onClick={spin}
          disabled={isSpinning}
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
