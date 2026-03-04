"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { MapMarker } from "./map-view";

interface MapOverlapPopoverProps {
  items: MapMarker[];
  anchorPos: { x: number; y: number };
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function MapOverlapPopover({
  items,
  anchorPos,
  onSelect,
  onClose,
}: MapOverlapPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<React.CSSProperties>({
    left: 0,
    top: 0,
    opacity: 0,
  });

  // Compute position after mount (needs actual element height)
  useLayoutEffect(() => {
    setPosition(computePosition(anchorPos, popoverRef.current));
  }, [anchorPos]);

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    // Delay with rAF to avoid closing from the same click that opened it
    let rafId = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    });
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 max-h-60 w-56 overflow-y-auto rounded-lg border shadow-lg"
      style={position}
    >
      <div className="p-1">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {items.length}개의 장소가 겹쳐 있습니다
        </p>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                onClick={() => onSelect(item.id)}
              >
                <MapPin className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  {item.category && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.category}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function computePosition(
  anchor: { x: number; y: number },
  el: HTMLElement | null,
): React.CSSProperties {
  const popoverWidth = 224; // w-56 = 14rem = 224px
  const popoverHeight = el?.offsetHeight ?? 200;
  const margin = 8;

  let left = anchor.x - popoverWidth / 2;
  let top = anchor.y - popoverHeight - margin;

  // Viewport edge adjustments
  const vw = window.innerWidth;

  if (left < margin) left = margin;
  if (left + popoverWidth > vw - margin) left = vw - popoverWidth - margin;
  if (top < margin) top = anchor.y + 28 + margin; // show below marker instead

  return { left, top };
}
