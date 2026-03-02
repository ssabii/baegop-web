"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SCROLL_KEY_PREFIX = "scroll:";

export function useScrollRestoration() {
  const pathname = usePathname();
  const isPopRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    function handlePopState() {
      isPopRef.current = true;
    }

    function handleScroll() {
      if (!isPopRef.current) {
        sessionStorage.setItem(
          SCROLL_KEY_PREFIX + pathname,
          String(window.scrollY),
        );
      }
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // 뒤로가기/앞으로가기 시 스크롤 위치 복원
  useEffect(() => {
    if (!isPopRef.current) return;

    const saved = sessionStorage.getItem(SCROLL_KEY_PREFIX + pathname);
    if (saved) {
      savedRef.current = true;
      const y = Number(saved);

      // 데이터 로드 후 스크롤 복원을 위해 약간의 딜레이
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
        isPopRef.current = false;
        savedRef.current = false;
      });
    } else {
      isPopRef.current = false;
    }
  }, [pathname]);
}
