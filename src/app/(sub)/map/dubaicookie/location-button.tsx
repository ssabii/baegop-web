"use client";

import { useCallback, useState } from "react";
import { LocateFixed } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

      <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>위치 접근 불가</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  현재 위치를 가져올 수 없습니다. 아래 설정을 확인해주세요
                </p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    <strong>iOS</strong>: 설정 &gt; 개인 정보 보호 및 보안 &gt;
                    위치 서비스에서 브라우저의 위치 접근을 허용해주세요
                  </li>
                  <li>
                    <strong>Android</strong>: 설정 &gt; 위치에서 위치 서비스를
                    켜고, 브라우저의 위치 접근을 허용해주세요
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col">
            <AlertDialogCancel className="w-full">확인</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
