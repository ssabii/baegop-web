"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubHeaderProps {
  title: string;
}

export function SubHeader({ title }: SubHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-center border-b border-border bg-background">
      <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
        <Button
          className="absolute left-0"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="truncate px-12 text-center text-base font-bold">
          {title}
        </h1>
      </div>
    </header>
  );
}
