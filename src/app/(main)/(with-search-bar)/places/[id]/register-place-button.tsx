"use client";

import { useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerPlace } from "@/app/(main)/actions";
import type { NaverPlaceDetail } from "@/types";

interface RegisterPlaceButtonProps {
  placeDetail: NaverPlaceDetail;
}

export function RegisterPlaceButton({ placeDetail }: RegisterPlaceButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleRegister() {
    startTransition(async () => {
      await registerPlace(placeDetail);
    });
  }

  return (
    <Button
      variant="outline"
      // size="sm"
      onClick={handleRegister}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Plus className="size-4" />
      )}
      장소 등록
    </Button>
  );
}
