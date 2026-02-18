"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
        <Spinner data-icon="inline-start" />
      ) : (
        <Plus className="size-4" />
      )}
      장소 등록
    </Button>
  );
}
