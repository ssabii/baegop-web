"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MachineState = "idle" | "spinning" | "dispensing";

// 다이얼을 한 바퀴(360도) 돌리면 뽑기가 실행됨
const SPIN_THRESHOLD_DEGREES = 360;

// 돔 내부에 장식용으로 표시되는 알록달록한 캡슐들
const DECORATIVE_CAPSULES = [
  { color: "#FF6B35", left: "20%", top: "14%", rotate: 35 },
  { color: "#F5C518", left: "52%", top: "8%", rotate: -25 },
  { color: "#3B82F6", left: "65%", top: "40%", rotate: 65 },
  { color: "#FF8C57", left: "22%", top: "50%", rotate: -40 },
  { color: "#60A5FA", left: "6%", top: "62%", rotate: 20 },
  { color: "#E8B800", left: "55%", top: "60%", rotate: -35 },
  { color: "#E05C3A", left: "38%", top: "28%", rotate: 55 },
  { color: "#9B59B6", left: "72%", top: "72%", rotate: -10 },
  { color: "#FF6B35", left: "42%", top: "68%", rotate: 80 },
  { color: "#F5C518", left: "10%", top: "30%", rotate: -60 },
];

// 뽑기 결과로 나올 캡슐의 색상 후보
const CAPSULE_COLORS = ["#FF6B35", "#F5C518", "#3B82F6", "#9B59B6", "#E05C3A"];

// 뽑기 연출 타이밍
const SPINNING_DURATION_MS = 800;
const DISPENSING_DURATION_MS = 1400;

interface FortuneMachineProps {
  rerollsLeft: number;
  showRemainingChances: boolean;
  onCapsuleReady: (capsuleColor: string) => void;
}

export function FortuneMachine({
  rerollsLeft,
  showRemainingChances,
  onCapsuleReady,
}: FortuneMachineProps) {
  const [state, setState] = useState<MachineState>("idle");
  const [capsuleColor, setCapsuleColor] = useState(CAPSULE_COLORS[0]);
  const [dialRotation, setDialRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dialRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);
  const lastPointerAngleRef = useRef(0);
  const accumulatedRotationRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  const pickRandomCapsuleColor = () =>
    CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)];

  const getPointerAngleFromDialCenter = (clientX: number, clientY: number) => {
    const dial = dialRef.current;
    if (!dial) return 0;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const triggerFortune = () => {
    const color = pickRandomCapsuleColor();
    setCapsuleColor(color);
    setState("spinning");
    hasTriggeredRef.current = true;
    isDraggingRef.current = false;
    setIsDragging(false);

    setTimeout(() => setState("dispensing"), SPINNING_DURATION_MS);
    setTimeout(() => {
      onCapsuleReady(color);
      resetMachine();
    }, SPINNING_DURATION_MS + DISPENSING_DURATION_MS);
  };

  const resetMachine = () => {
    setState("idle");
    setDialRotation(0);
    hasTriggeredRef.current = false;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (state !== "idle") return;
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

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;

    const currentAngle = getPointerAngleFromDialCenter(e.clientX, e.clientY);
    let angleDelta = currentAngle - lastPointerAngleRef.current;

    // atan2는 -180~180 범위이므로 경계를 넘을 때 값이 튀는 것을 보정
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;

    accumulatedRotationRef.current += angleDelta;
    lastPointerAngleRef.current = currentAngle;
    setDialRotation((prev) => prev + angleDelta);

    const hasSpunEnough =
      Math.abs(accumulatedRotationRef.current) >= SPIN_THRESHOLD_DEGREES;

    if (hasSpunEnough && !hasTriggeredRef.current) {
      triggerFortune();
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // 충분히 돌리지 못한 경우 다이얼을 원위치로 되돌림
    if (!hasTriggeredRef.current) {
      setDialRotation(0);
    }
  };

  return (
    <>
      <style>{`
        @keyframes machine-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15%  { transform: translateX(-6px) rotate(-1.5deg); }
          35%  { transform: translateX(6px) rotate(1.5deg); }
          55%  { transform: translateX(-4px) rotate(-0.8deg); }
          75%  { transform: translateX(4px) rotate(0.8deg); }
        }
        @keyframes capsule-drop {
          0%   { transform: translateY(-80px); opacity: 0; }
          55%  { transform: translateY(6px); opacity: 1; }
          75%  { transform: translateY(-4px); }
          90%  { transform: translateY(2px); }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col items-center px-4 pt-10">
        {showRemainingChances && (
          <p className="mb-4 text-sm font-medium text-[#8B3A00]">
            남은 기회 {rerollsLeft}번
          </p>
        )}

        <div className="mx-auto w-[260px]">
          <div
            style={{
              animation:
                state === "spinning"
                  ? "machine-shake 0.6s ease-in-out"
                  : undefined,
            }}
          >
            {/* 캡슐 돔 (장식용 캡슐들이 보이는 상단 유리 부분) */}
            <div className="relative mx-auto h-[190px] w-[190px] overflow-hidden rounded-full border-[5px] border-orange-200 bg-orange-50/80 shadow-inner">
              {DECORATIVE_CAPSULES.map((capsule, index) => (
                <div
                  key={index}
                  className="absolute rounded-full opacity-80"
                  style={{
                    backgroundColor: capsule.color,
                    left: capsule.left,
                    top: capsule.top,
                    transform: `rotate(${capsule.rotate}deg)`,
                    width: "18px",
                    height: "30px",
                  }}
                />
              ))}
              {/* 유리 반사광 */}
              <div
                className="absolute rounded-full bg-white/25"
                style={{
                  width: "38px",
                  height: "62px",
                  left: "17%",
                  top: "11%",
                  transform: "rotate(-20deg)",
                }}
              />
            </div>

            {/* 돔과 본체를 잇는 목 부분 */}
            <div className="mx-auto h-5 w-[88px] border-x-4 border-orange-300/60 bg-orange-200/60" />

            {/* 머신 본체 (브랜드 라벨, 배출구, 다이얼) */}
            <div className="rounded-b-3xl rounded-t-sm border-4 border-orange-300/60 bg-orange-100/60 px-5 pb-6 pt-4 shadow-lg">
              <div className="mb-4 rounded-lg bg-primary py-2 text-center">
                <span className="text-sm font-bold tracking-[0.15em] text-primary-foreground">
                  배곱 캡슐
                </span>
              </div>

              {/* 캡슐이 나오는 배출구 */}
              <div className="relative mb-5 flex h-[72px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-orange-300/50 bg-orange-200/30">
                {state === "idle" && (
                  <span className="text-xs font-medium text-orange-400/70">
                    배출구
                  </span>
                )}
                {state === "spinning" && <SpinningDots />}
                {state === "dispensing" && (
                  <DroppedCapsule color={capsuleColor} />
                )}
              </div>

              {/* 다이얼 (360도 돌리면 뽑기 실행) */}
              <div className="flex flex-col items-center gap-2">
                <button
                  ref={dialRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  disabled={state !== "idle"}
                  className={cn(
                    "relative h-[72px] w-[72px] touch-none rounded-full border-[5px] border-orange-300 bg-primary",
                    "shadow-[0_6px_0_0_oklch(0.5_0.2_40)]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    {
                      "cursor-grabbing": isDragging,
                      "cursor-grab": !isDragging,
                    },
                  )}
                  style={{
                    transform: `rotate(${dialRotation}deg)`,
                    transition: isDragging
                      ? "none"
                      : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  aria-label="운세 뽑기 — 다이얼을 돌리세요"
                >
                  <div className="absolute left-1/2 top-[10px] h-[22px] w-[6px] -translate-x-1/2 rounded-full bg-white/80" />
                </button>

                <span
                  className={cn(
                    "text-sm font-medium text-orange-600 transition-opacity duration-300",
                    { "opacity-0": state !== "idle" },
                  )}
                >
                  다이얼을 돌려보세요
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 뽑기 중일 때 배출구에서 표시되는 로딩 점 3개
function SpinningDots() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-2 w-2 animate-bounce rounded-full bg-orange-400"
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// 뽑기 완료 시 배출구에서 떨어지는 색상 원형 캡슐
function DroppedCapsule({ color }: { color: string }) {
  return (
    <div
      className="h-10 w-10 rounded-full shadow-md"
      style={{
        backgroundColor: color,
        animation: "capsule-drop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}
    />
  );
}
