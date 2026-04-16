"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  BACKGROUND,
  INITIAL_CAPSULE_COLOR,
  MAX_ROLLS,
} from "./constants";
import {
  getAlternativeRestaurant,
  getDailyRestaurant,
  type MockRestaurant,
} from "./fortune-data";
import { FortuneDetail } from "./fortune-detail";
import { FortuneMachine } from "./fortune-machine";
import { FortuneResultCard } from "./fortune-result-card";
import { FortuneTransition } from "./fortune-transition";

type Phase = "machine" | "transition" | "result" | "detail";

export function FortuneCapsulePage() {
  const [phase, setPhase] = useState<Phase>("machine");
  const [capsuleColor, setCapsuleColor] = useState(INITIAL_CAPSULE_COLOR);
  const [restaurant, setRestaurant] = useState<MockRestaurant | null>(null);
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  // pickedIds.length는 지금까지 몇 번 뽑았는지와 같음
  const rollCount = pickedIds.length;
  const rerollsLeft = MAX_ROLLS - rollCount;
  const hasRolledBefore = rollCount > 0;

  const pickNextRestaurant = (): MockRestaurant => {
    if (rollCount === 0) return getDailyRestaurant();
    return getAlternativeRestaurant(pickedIds, rollCount);
  };

  const handleCapsuleReady = (color: string) => {
    const nextRestaurant = pickNextRestaurant();
    setCapsuleColor(color);
    setRestaurant(nextRestaurant);
    setPickedIds((prev) => [...prev, nextRestaurant.id]);
    setPhase("transition");
  };

  const handleTransitionComplete = () => setPhase("result");
  const handleAccept = () => setPhase("detail");
  const handleBackFromDetail = () => setPhase("result");
  const handleReroll = () => setPhase("machine");

  // 결과/상세 화면은 깔끔한 흰 배경, 뽑기/전환 화면은 따뜻한 그라데이션 배경
  const isResultLikePhase = phase === "result" || phase === "detail";
  const backgroundStyle = {
    background: isResultLikePhase ? BACKGROUND.white : BACKGROUND.warm,
  };

  return (
    <main
      className="flex min-h-dvh flex-col transition-colors duration-300"
      style={backgroundStyle}
    >
      <div className="mx-auto w-full max-w-sm flex-1">
        {phase === "machine" && (
          <FortuneMachine
            rerollsLeft={rerollsLeft}
            showRemainingChances={hasRolledBefore}
            onCapsuleReady={handleCapsuleReady}
          />
        )}

        <AnimatePresence>
          {phase === "transition" && (
            <FortuneTransition
              capsuleColor={capsuleColor}
              onComplete={handleTransitionComplete}
            />
          )}
        </AnimatePresence>

        {phase === "result" && restaurant && (
          <FortuneResultCard
            restaurant={restaurant}
            rerollsLeft={rerollsLeft}
            onAccept={handleAccept}
            onReroll={handleReroll}
          />
        )}

        {phase === "detail" && restaurant && (
          <FortuneDetail
            restaurant={restaurant}
            rerollsLeft={rerollsLeft}
            onBack={handleBackFromDetail}
            onRetry={handleReroll}
          />
        )}
      </div>
    </main>
  );
}
