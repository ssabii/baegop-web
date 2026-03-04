"use client";

import { useCallback, useState } from "react";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LocationButtonProps {
  onLocate: (position: { lat: number; lng: number }) => void;
}

export function LocationButton({ onLocate }: LocationButtonProps) {
  const [errorOpen, setErrorOpen] = useState(false);

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorOpen(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setErrorOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [onLocate]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
        aria-label="현재 위치"
      >
        <LocateFixed className="size-5 text-foreground" />
      </button>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="max-w-xs" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>위치 접근 불가</DialogTitle>
            <DialogDescription>
              현재 위치를 가져올 수 없습니다.
              <br />
              위치 서비스를 허용해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                size="xl"
                className="w-full"
                onClick={() => setErrorOpen(false)}
              >
                확인
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
