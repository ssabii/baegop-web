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
      <div className="relative flex justify-center max-w-4xl mx-auto">
        <Button
          size="xl"
          className="rounded-full"
          onClick={onSpin}
          disabled={disabled}
        >
          {isSpinning ? <Spinner aria-label="로딩 중" /> : <Shuffle />}
          랜덤 뽑기
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="rounded-full bottom-0 right-4 absolute p-4"
          onClick={onFilterOpen}
        >
          <SlidersHorizontal />
        </Button>
      </div>
    </div>
  );
}
