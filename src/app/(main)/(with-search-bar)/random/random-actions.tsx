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
    <div className="fixed inset-x-0 bottom-20">
      <div className="w-full max-w-4xl mx-auto relative flex justify-center">
        <Button
          size="xl"
          className="rounded-full"
          onClick={onSpin}
          disabled={disabled}
        >
          {isSpinning ? <Spinner aria-label="로딩 중" /> : <Shuffle />}
          랜덤뽑기
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-4 size-12 rounded-full"
          onClick={onFilterOpen}
        >
          <SlidersHorizontal />
        </Button>
      </div>
    </div>
  );
}
