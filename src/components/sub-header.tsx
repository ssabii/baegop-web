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
    <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-border bg-background px-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  );
}
