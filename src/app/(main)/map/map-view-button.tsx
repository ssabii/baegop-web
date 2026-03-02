"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MapViewButtonProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
}

export function MapViewButton({ scrollRef, onClick }: MapViewButtonProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const currentTop = el.scrollTop;
      const isScrollingUp = currentTop < lastScrollTopRef.current;
      setVisible(isScrollingUp || currentTop <= 0);
      lastScrollTopRef.current = currentTop;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-4 flex justify-center transition-all duration-300",
        {
          "translate-y-0 opacity-100": visible,
          "translate-y-4 opacity-0 pointer-events-none": !visible,
        },
      )}
    >
      <Button className="rounded-full shadow-lg" onClick={onClick}>
        <MapPin className="size-4" />
        지도보기
      </Button>
    </div>
  );
}
