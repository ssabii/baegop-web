"use client";

import { useState, useCallback } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/restaurant-card";

interface RestaurantData {
  id: number;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  like_count: number | null;
  image_urls: string[] | null;
}

interface RouletteProps {
  restaurants: RestaurantData[];
}

export function Roulette({ restaurants }: RouletteProps) {
  const [result, setResult] = useState<RestaurantData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = useCallback(() => {
    if (restaurants.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    // 슬롯머신 느낌의 빠른 변경 후 최종 결과
    let count = 0;
    const totalTicks = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setResult(restaurants[randomIndex]);
      count++;

      if (count >= totalTicks) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * restaurants.length);
        setResult(restaurants[finalIndex]);
        setIsSpinning(false);
      }
    }, 100);
  }, [restaurants]);

  if (restaurants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        등록된 맛집이 없습니다. 먼저 맛집을 등록해주세요!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        size="lg"
        className="gap-2"
        onClick={spin}
        disabled={isSpinning}
      >
        <Shuffle className={`size-4 ${isSpinning ? "animate-spin" : ""}`} />
        {isSpinning ? "고르는 중..." : result ? "다시 뽑기" : "맛집 뽑기!"}
      </Button>

      {result && (
        <div
          className={`transition-all duration-300 ${
            isSpinning ? "scale-95 opacity-50" : "scale-100 opacity-100"
          }`}
        >
          <RestaurantCard restaurant={result} />
        </div>
      )}
    </div>
  );
}
