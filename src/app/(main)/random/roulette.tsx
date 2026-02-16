"use client";

import { useState, useCallback } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceCard } from "@/components/place-card";

interface PlaceData {
  id: number;
  name: string;
  address: string;
  category: string | null;
  kona_card_status: string | null;
  like_count: number | null;
  image_urls: string[] | null;
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
    setResult(null);

    // 슬롯머신 느낌의 빠른 변경 후 최종 결과
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

  if (places.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        등록된 장소가 없습니다. 먼저 장소를 등록해주세요!
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
        {isSpinning ? "고르는 중..." : result ? "다시 뽑기" : "장소 뽑기!"}
      </Button>

      {result && (
        <div
          className={`transition-all duration-300 ${
            isSpinning ? "scale-95 opacity-50" : "scale-100 opacity-100"
          }`}
        >
          <PlaceCard place={result} />
        </div>
      )}
    </div>
  );
}
