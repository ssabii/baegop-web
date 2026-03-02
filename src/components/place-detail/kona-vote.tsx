"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useKonaVote } from "./use-kona-vote";
import type { KonaCardStatus, KonaVote } from "@/types";

interface KonaVoteProps {
  placeId: string;
  status: KonaCardStatus;
  userVote: KonaVote | null;
  isLoggedIn: boolean;
  onLoginRequired?: () => void;
  showLoginAlert?: boolean;
}

const STATUS_CONFIG: Record<
  KonaCardStatus,
  { label: string; className: string }
> = {
  available: {
    label: "결제 가능",
    className: "text-purple-700 dark:text-purple-300",
  },
  unavailable: {
    label: "결제 불가",
    className: "text-muted-foreground",
  },
  unknown: {
    label: "미확인",
    className: "text-muted-foreground",
  },
};

export function KonaVoteSection({
  placeId,
  status: initialStatus,
  userVote: initialUserVote,
  isLoggedIn,
  onLoginRequired,
  showLoginAlert,
}: KonaVoteProps) {
  const router = useRouter();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { status, userVote, vote, isPending, pendingVote } = useKonaVote({
    placeId,
    initialStatus,
    initialUserVote,
    onSuccess: () => router.refresh(),
  });

  const config = STATUS_CONFIG[status];
  const showVoteUI = isLoggedIn || onLoginRequired || showLoginAlert;

  function handleVote(voteValue: KonaVote) {
    if (!isLoggedIn) {
      if (showLoginAlert) {
        setLoginDialogOpen(true);
        return;
      }
      onLoginRequired?.();
      return;
    }
    vote(voteValue);
  }

  return (
    <>
      <section className="rounded-xl bg-muted p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icons/kona.png" alt="코나카드" className="size-4" />
            <span className="text-sm font-bold">코나카드</span>
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground/60 cursor-pointer focus-visible:outline-none"
                  aria-label="코나카드 결제 안내"
                >
                  <Info className="size-3.5" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="max-w-4xl mx-auto w-full p-4">
                  <DrawerHeader>
                    <DrawerTitle className="text-left">코나카드</DrawerTitle>
                    <DrawerDescription className="text-left">
                      결제 가능 여부를 투표해주세요. <br />
                      투표 결과에 따라 가능 여부가 표시돼요.
                    </DrawerDescription>
                  </DrawerHeader>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          <span className={cn("text-sm font-semibold", config.className)}>
            {config.label}
          </span>
        </div>

        {showVoteUI && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              코나카드 결제가 가능한가요?
            </span>
            <div className="flex items-center gap-1">
              <Toggle
                size="sm"
                variant="outline"
                pressed={userVote === "available"}
                onPressedChange={() => handleVote("available")}
                disabled={isPending}
                className={cn(
                  "px-2 h-[30px] text-xs cursor-pointer rounded-lg",
                  {
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground":
                      userVote === "available",
                  },
                )}
              >
                {isPending && pendingVote === "available" && <Spinner />}
                가능
              </Toggle>
              <Toggle
                size="sm"
                variant="outline"
                pressed={userVote === "unavailable"}
                onPressedChange={() => handleVote("unavailable")}
                disabled={isPending}
                className={cn(
                  "px-2 h-[30px] text-xs cursor-pointer rounded-lg",
                  {
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground":
                      userVote === "unavailable",
                  },
                )}
              >
                {isPending && pendingVote === "unavailable" && <Spinner />}
                불가
              </Toggle>
            </div>
          </div>
        )}
      </section>

      {showLoginAlert && (
        <LoginAlertDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          description="로그인 하시면 코나카드 투표를 할 수 있어요."
        />
      )}
    </>
  );
}
