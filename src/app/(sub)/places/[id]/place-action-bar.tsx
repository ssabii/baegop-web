"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
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
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginDialogDescription, setLoginDialogDescription] = useState("");

  function handleRegister() {
    if (!isLoggedIn) {
      setLoginDialogDescription(
        "로그인 하시면 장소 등록을 할 수 있어요.",
      );
      setLoginDialogOpen(true);
      return;
    }

    startTransition(async () => {
      await registerPlace(placeDetail);
      router.refresh();
    });
  }

  function handleWriteReview() {
    if (!isLoggedIn) {
      setLoginDialogDescription(
        "로그인 하시면 리뷰 작성을 할 수 있어요.",
      );
      setLoginDialogOpen(true);
      return;
    }

    if (!isRegistered) {
      startTransition(async () => {
        await registerPlace(placeDetail);
        router.replace(`/places/${naverPlaceId}/review/new`);
      });
    } else {
      router.push(`/places/${naverPlaceId}/review/new`);
    }
  }

  return (
    <>
      <BottomActionBar>
        <div className="mx-auto flex max-w-4xl gap-3">
          {!isRegistered && (
            <Button
              variant="outline"
              size="xl"
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
            size="xl"
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            리뷰 작성
          </Button>
        </div>
      </BottomActionBar>

      <LoginAlertDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        description={loginDialogDescription}
      />
    </>
  );
}
