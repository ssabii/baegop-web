"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInMapButtonProps {
  visible: boolean;
  onClick: () => void;
  className?: string;
}

export function SearchInMapButton({
  visible,
  onClick,
  className,
}: SearchInMapButtonProps) {
  return (
    <div
      className={cn(
        "absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-300",
        {
          "opacity-100 translate-y-0": visible,
          "opacity-0 translate-y-2 pointer-events-none": !visible,
        },
      )}
    >
      <Button
        variant="default"
        size="sm"
        className={cn("rounded-full shadow-lg", className)}
        onClick={onClick}
      >
        <RotateCcw className="size-4" />
        현 지도에서 검색
      </Button>
    </div>
  );
}
