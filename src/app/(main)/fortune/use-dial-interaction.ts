"use client";

import { useRef, useState } from "react";
import { SPIN_THRESHOLD_DEGREES } from "./fortune-constants";

interface UseDialInteractionOptions {
  // false일 때는 다이얼이 반응하지 않음 (뽑기 중/완료 후 비활성화)
  enabled: boolean;
  // 다이얼이 SPIN_THRESHOLD_DEGREES 이상 돌아갔을 때 한 번만 호출됨
  onSpinComplete: () => void;
}

interface UseDialInteractionResult {
  dialRef: React.RefObject<HTMLButtonElement | null>;
  rotation: number;
  isDragging: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => void;
    onPointerUp: () => void;
  };
  reset: () => void;
}

// 다이얼 드래그 인터랙션을 캡슐화하는 훅.
// 여러 ref가 한 포인터 상태 머신을 구성하는 복잡성을 감추고,
// 컴포넌트는 "돌아갔는가?"라는 결과만 콜백으로 받는다.
export function useDialInteraction({
  enabled,
  onSpinComplete,
}: UseDialInteractionOptions): UseDialInteractionResult {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dialRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);
  const lastPointerAngleRef = useRef(0);
  const accumulatedRotationRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  const getPointerAngleFromDialCenter = (clientX: number, clientY: number) => {
    const dial = dialRef.current;
    if (!dial) return 0;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!enabled) return;
    e.preventDefault();
    dialRef.current?.setPointerCapture(e.pointerId);

    isDraggingRef.current = true;
    hasTriggeredRef.current = false;
    accumulatedRotationRef.current = 0;
    lastPointerAngleRef.current = getPointerAngleFromDialCenter(
      e.clientX,
      e.clientY,
    );
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;

    const currentAngle = getPointerAngleFromDialCenter(e.clientX, e.clientY);
    let angleDelta = currentAngle - lastPointerAngleRef.current;

    // atan2는 -180~180 범위이므로 경계를 넘을 때 값이 튀는 것을 보정
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;

    accumulatedRotationRef.current += angleDelta;
    lastPointerAngleRef.current = currentAngle;
    setRotation((prev) => prev + angleDelta);

    const hasSpunEnough =
      Math.abs(accumulatedRotationRef.current) >= SPIN_THRESHOLD_DEGREES;

    if (hasSpunEnough && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      isDraggingRef.current = false;
      setIsDragging(false);
      onSpinComplete();
    }
  };

  const onPointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // 충분히 돌리지 못한 경우 다이얼을 원위치로 되돌림
    if (!hasTriggeredRef.current) {
      setRotation(0);
    }
  };

  const reset = () => {
    setRotation(0);
    hasTriggeredRef.current = false;
  };

  return {
    dialRef,
    rotation,
    isDragging,
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    reset,
  };
}
