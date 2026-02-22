"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
import { toast } from "sonner";
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
  const [pendingAction, setPendingAction] = useState<
    "register" | "review" | null
  >(null);
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

    setPendingAction("register");
    startTransition(async () => {
      try {
        await registerPlace(placeDetail);
        router.refresh();
        toast.success("장소가 등록되었어요.", { position: "top-center" });
      } catch {
        toast.error("장소 등록에 실패했어요. 다시 시도해주세요.", { position: "top-center" });
      }
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
      setPendingAction("review");
      startTransition(async () => {
        try {
          await registerPlace(placeDetail);
        } catch {
          toast.error("장소 등록에 실패했어요. 다시 시도해주세요.", { position: "top-center" });
          return;
        }
        router.push(`/places/${naverPlaceId}/review/new`);
      });
    } else {
      router.push(`/places/${naverPlaceId}/review/new`);
    }
  }

  return (
    <>
      <BottomActionBar>
        <div
          className={cn("mx-auto max-w-4xl grid gap-3", {
            "grid-cols-2": !isRegistered,
          })}
        >
          {!isRegistered && (
            <Button
              variant="outline"
              size="xl"
              onClick={handleRegister}
              disabled={isPending}
            >
              {isPending && pendingAction === "register" ? <Spinner /> : "장소 등록"}
            </Button>
          )}
          <Button
            onClick={handleWriteReview}
            disabled={isPending}
            size="xl"
          >
            {isPending && pendingAction === "review" ? <Spinner /> : "리뷰 작성"}
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
