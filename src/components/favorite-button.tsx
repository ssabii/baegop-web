"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
import { useFavorites } from "@/hooks/use-favorites";
import { useFavoriteMutation } from "@/hooks/use-favorite-mutation";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  placeId: string;
  className?: string;
}

export function FavoriteButton({ placeId, className }: FavoriteButtonProps) {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { profile } = useProfile();
  const { favoriteIds } = useFavorites();
  const { mutate, isPending } = useFavoriteMutation();

  const isFavorited = favoriteIds.has(placeId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!profile) {
      setLoginDialogOpen(true);
      return;
    }

    if (isPending) return;
    mutate(placeId);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-full", className)}
        onClick={handleClick}
        aria-label={isFavorited ? "찜 해제" : "찜하기"}
      >
        <Heart
          className={cn("size-5", {
            "fill-rose-500 text-rose-500 animate-[favorite-bounce_0.3s_ease]":
              isFavorited,
          })}
        />
      </Button>
      <LoginAlertDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        description="로그인 하시면 내 장소에 추가할 수 있어요"
      />
    </>
  );
}
