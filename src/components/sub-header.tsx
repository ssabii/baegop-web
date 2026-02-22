"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function SubHeader({ title, onBack, rightElement }: SubHeaderProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    const nav = (window as { navigation?: { canGoBack?: boolean } }).navigation;
    const canGoBack =
      nav?.canGoBack ?? document.referrer.startsWith(window.location.origin);

    if (canGoBack) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-center border-b border-border bg-background">
      <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
        <Button
          className="absolute left-0"
          variant="ghost"
          size="icon"
          onClick={onBack ?? handleBack}
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="truncate px-12 text-center text-base font-bold">
          {title}
        </h1>
        {rightElement && (
          <div className="absolute right-0">{rightElement}</div>
        )}
      </div>
    </header>
  );
}
