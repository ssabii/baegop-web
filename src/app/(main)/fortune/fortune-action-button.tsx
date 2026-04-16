"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIMARY_GRADIENT = "linear-gradient(to bottom, #e55a28, #bf3210)";
const PRIMARY_SHADOW = "0 4px 0 #8B2008";

const SECONDARY_GRADIENT = "linear-gradient(to bottom, #d4891e, #b06a10)";
const SECONDARY_SHADOW = "0 4px 0 #7a4a08";

type Variant = "primary" | "secondary";

interface FortuneActionButtonProps {
  variant: Variant;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// 운명 수락/거부/다시하기 등에 공통으로 쓰이는 큰 액션 버튼.
// variant에 따라 주황(primary) 또는 황금빛(secondary) 그라데이션을 적용한다.
export function FortuneActionButton({
  variant,
  disabled,
  onClick,
  children,
}: FortuneActionButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Button
      size="xl"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full text-base font-bold tracking-wide",
        "disabled:opacity-40",
      )}
      style={{
        background: isPrimary ? PRIMARY_GRADIENT : SECONDARY_GRADIENT,
        border: "none",
        boxShadow: isPrimary ? PRIMARY_SHADOW : SECONDARY_SHADOW,
      }}
    >
      {children}
    </Button>
  );
}
