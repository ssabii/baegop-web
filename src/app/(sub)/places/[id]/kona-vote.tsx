"use client";

import { useRouter } from "next/navigation";
import { Check, Info } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
}: KonaVoteProps) {
  const router = useRouter();
  const { status, userVote, vote, isPending } = useKonaVote({
    placeId,
    initialStatus,
    initialUserVote,
    onSuccess: () => router.refresh(),
  });

  const config = STATUS_CONFIG[status];

  return (
    <section className="rounded-xl bg-muted p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/kona.png" alt="코나카드" className="size-4" />
          <span className="text-sm font-bold">코나카드</span>
        </div>
        <span className={cn("text-sm font-semibold", config.className)}>
          {config.label}
        </span>
      </div>

      {isLoggedIn && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              코나카드 결제가 가능한가요?
            </span>
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground"
                  aria-label="코나카드 결제 안내"
                >
                  <Info className="size-3.5" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>코나카드 결제 여부</DrawerTitle>
                  <DrawerDescription>
                    코나카드 결제가 가능하다면 동료가 알 수 있게 투표해주세요.
                  </DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </div>
          <div className="flex items-center gap-1.5">
            <Toggle
              variant="outline"
              size="sm"
              pressed={userVote === "available"}
              onPressedChange={() => vote("available")}
              disabled={isPending}
            >
              {isPending && userVote === "available" ? (
                <Spinner />
              ) : (
                <Check
                  className={cn({ "fill-foreground": userVote === "available" })}
                />
              )}
              가능
            </Toggle>
            <Toggle
              variant="outline"
              size="sm"
              pressed={userVote === "unavailable"}
              onPressedChange={() => vote("unavailable")}
              disabled={isPending}
            >
              {isPending && userVote === "unavailable" ? (
                <Spinner />
              ) : (
                <Check
                  className={cn({
                    "fill-foreground": userVote === "unavailable",
                  })}
                />
              )}
              불가
            </Toggle>
          </div>
        </div>
      )}
    </section>
  );
}
