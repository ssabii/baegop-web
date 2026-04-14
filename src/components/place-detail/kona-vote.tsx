"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InfoDrawer } from "@/components/info-drawer";
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
      <section className="bg-muted space-y-3 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icons/kona.png" alt="코나카드" className="size-4" />
            <span className="text-sm font-bold">코나카드</span>
            <InfoDrawer
              title="코나카드"
              trigger={{ "aria-label": "코나카드 투표 안내" }}
              description="결제 가능 여부를 투표해주세요. 투표 결과에 따라 가능 여부가 표시돼요."
            />
          </div>
          <span className={cn("text-sm font-semibold", config.className)}>
            {config.label}
          </span>
        </div>

        {showVoteUI && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              코나카드 결제가 가능한가요?
            </span>
            <div className="flex items-center gap-1">
              <Toggle
                size="sm"
                variant="outline"
                pressed={userVote === "unavailable"}
                onPressedChange={() => handleVote("unavailable")}
                disabled={isPending}
                className={cn(
                  "h-[30px] cursor-pointer rounded-lg px-2 text-xs",
                  {
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground":
                      userVote === "unavailable",
                  },
                )}
              >
                {isPending && pendingVote === "unavailable" && <Spinner />}
                불가
              </Toggle>
              <Toggle
                size="sm"
                variant="outline"
                pressed={userVote === "available"}
                onPressedChange={() => handleVote("available")}
                disabled={isPending}
                className={cn(
                  "h-[30px] cursor-pointer rounded-lg px-2 text-xs",
                  {
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground":
                      userVote === "available",
                  },
                )}
              >
                {isPending && pendingVote === "available" && <Spinner />}
                가능
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
