"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { registerPlace } from "@/app/(main)/actions";
import type { NaverPlaceDetail } from "@/types";

interface PlaceActionBarProps {
  isRegistered: boolean;
  isLoggedIn: boolean;
  naverPlaceId: string;
  placeDetail: NaverPlaceDetail;
}

export function PlaceActionBar({
  isRegistered,
  isLoggedIn,
  naverPlaceId,
  placeDetail,
}: PlaceActionBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRegister() {
    if (!isLoggedIn) {
      router.push(`/signin?redirect=/places/${naverPlaceId}`);
      return;
    }

    startTransition(async () => {
      await registerPlace(placeDetail);
    });
  }

  function handleWriteReview() {
    if (!isLoggedIn) {
      router.push(`/signin?redirect=/places/${naverPlaceId}/review`);
      return;
    }

    if (!isRegistered) {
      startTransition(async () => {
        await registerPlace(placeDetail);
        router.push(`/places/${naverPlaceId}/review`);
      });
    } else {
      router.push(`/places/${naverPlaceId}/review`);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background px-4 py-3">
      <div className="mx-auto flex max-w-4xl gap-3">
        {!isRegistered && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleRegister}
            disabled={isPending}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            장소 등록
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleWriteReview}
          disabled={isPending}
          size="lg"
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          리뷰 작성
        </Button>
      </div>
    </div>
  );
}
