"use client";

import { useEffect, useState, useTransition } from "react";
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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!isRegistered && !localStorage.getItem("hideRegisterTooltip")) {
      setShowTooltip(true);
    }
  }, [isRegistered]);

  function dismissTooltip() {
    setShowTooltip(false);
    localStorage.setItem("hideRegisterTooltip", "true");
  }

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
            <div className="relative">
              {showTooltip && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg">
                  배곱에 장소를 등록해보세요
                  <button
                    type="button"
                    onClick={dismissTooltip}
                    className="ml-1.5 cursor-pointer text-background/70"
                    aria-label="닫기"
                  >
                    ✕
                  </button>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                </div>
              )}
              <Button
                variant="outline"
                size="xl"
                className="w-full bg-orange-100 text-orange-700 transition-none hover:bg-orange-200 has-[>svg]:px-8 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/70"
                onClick={handleRegister}
                disabled={isPending}
              >
                {isPending && pendingAction === "register" && <Spinner />}
                장소 등록
              </Button>
            </div>
          )}
          <Button
            onClick={handleWriteReview}
            disabled={isPending}
            size="xl"
            className="transition-none has-[>svg]:px-8"
          >
            {isPending && pendingAction === "review" && <Spinner />}
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
