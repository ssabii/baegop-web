import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface RandomActionsProps {
  onSpin: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export function RandomActions({
  onSpin,
  disabled,
  isSpinning,
}: RandomActionsProps) {
  return (
    <div className="absolute bottom-4 right-4">
      <Button
        className="rounded-full size-12"
        onClick={onSpin}
        disabled={disabled}
      >
        {isSpinning ? (
          <Spinner className="size-6" aria-label="로딩 중" />
        ) : (
          <Shuffle className="size-6" />
        )}
      </Button>
    </div>
  );
}
