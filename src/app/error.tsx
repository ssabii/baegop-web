"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex h-dvh flex-col">
      <Empty className="flex-1 border-none">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <AlertCircle className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">문제가 발생했어요</EmptyTitle>
          <EmptyDescription>
            잠시 후 다시 시도해주세요
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="xl" onClick={reset}>
            다시 시도
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
