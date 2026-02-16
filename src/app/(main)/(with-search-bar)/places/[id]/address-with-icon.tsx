"use client";

import { MapPin } from "lucide-react";
import { useRef, useState, useEffect } from "react";

/** 주소가 2줄 초과면 아이콘을 위쪽 정렬(items-start), 아니면 가운데 정렬(items-center) */
export function AddressWithIcon({ address }: { address: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [alignStart, setAlignStart] = useState(true);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const check = () => {
      const style = getComputedStyle(el);
      const lineHeight = parseFloat(style.lineHeight);
      const lineCount = lineHeight > 0 ? el.scrollHeight / lineHeight : 1;
      setAlignStart(lineCount > 2);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [address]);

  return (
    <p
      className={`flex gap-2 text-sm font-medium text-muted-foreground ${alignStart ? "items-start" : "items-center"}`}
    >
      <MapPin
        className={`size-4 shrink-0 ${alignStart ? "mt-0.5" : ""}`}
        aria-hidden
      />
      <span ref={textRef}>{address}</span>
    </p>
  );
}
