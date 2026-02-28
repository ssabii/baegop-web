"use client";

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
  const { status, userVote, vote, isPending, pendingVote } = useKonaVote({
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
          <Drawer>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground/60 cursor-pointer"
                aria-label="코나카드 결제 안내"
              >
                <Info className="size-3.5" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="max-w-4xl mx-auto w-full p-4">
                <DrawerHeader>
                  <DrawerTitle className="text-left">
                    코나카드 결제가 가능한가요?
                  </DrawerTitle>
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

      {isLoggedIn && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            코나카드 결제가 가능한가요?
          </span>
          <div className="flex items-center gap-1">
            <Toggle
              size="sm"
              variant="outline"
              pressed={userVote === "available"}
              onPressedChange={() => vote("available")}
              disabled={isPending}
              className={cn("px-1.5 py-0.5 cursor-pointer rounded-lg", {
                "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground":
                  userVote === "available",
              })}
            >
              {isPending && pendingVote === "available" && <Spinner />}
              가능
            </Toggle>
            <Toggle
              size="sm"
              variant="outline"
              pressed={userVote === "unavailable"}
              onPressedChange={() => vote("unavailable")}
              disabled={isPending}
              className={cn("px-1.5 py-0.5 cursor-pointer rounded-lg", {
                "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground":
                  userVote === "unavailable",
              })}
            >
              {isPending && pendingVote === "unavailable" && <Spinner />}
              불가
            </Toggle>
          </div>
        </div>
      )}
    </section>
  );
}
