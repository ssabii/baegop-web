import { useRef, useEffect, type RefObject } from "react";

/**
 * Prevents browser pull-to-refresh and overscroll bounce when
 * a sheet's scroll container is at its scroll boundaries.
 *
 * When `isScrollable` is false, resets scrollTop and detaches listeners.
 */
export function useSheetScrollLock(
  isScrollable: boolean
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!isScrollable) {
      el.scrollTop = 0;
      return;
    }

    function handleTouchStart(e: TouchEvent) {
      startY.current = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!el) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;
      const { scrollTop, scrollHeight, clientHeight } = el;

      // At top edge, swiping down → block pull-to-refresh
      if (scrollTop <= 0 && deltaY > 0) {
        e.preventDefault();
        return;
      }

      // At bottom edge, swiping up → block overscroll bounce
      if (scrollTop >= scrollHeight - clientHeight && deltaY < 0) {
        e.preventDefault();
      }
    }

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isScrollable]);

  return ref;
}
