"use client";

import { useEffect, useRef } from "react";

export function useIsBackNavigation() {
  const isBackRef = useRef(false);

  useEffect(() => {
    function handlePopState() {
      isBackRef.current = true;
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /** 한 번 읽으면 자동으로 false로 리셋 */
  function consumeIsBack(): boolean {
    const value = isBackRef.current;
    isBackRef.current = false;
    return value;
  }

  return consumeIsBack;
}
