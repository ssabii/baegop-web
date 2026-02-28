import { Shuffle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface RandomActionsProps {
  onSpin: () => void;
  onFilterOpen: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export function RandomActions({
  onSpin,
  onFilterOpen,
  disabled,
  isSpinning,
}: RandomActionsProps) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-20 flex justify-center">
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

      <Button
        variant="secondary"
        className="fixed bottom-20 right-4 rounded-full size-12"
        onClick={onFilterOpen}
      >
        <SlidersHorizontal className="size-5" />
      </Button>
    </>
  );
}
