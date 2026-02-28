"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { COMPANY_LOCATION } from "@/lib/constants";

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onReady?: (map: naver.maps.Map) => (() => void) | void;
  className?: string;
}

const DARK_STYLE_ID = "94230366-adba-4e0e-ac5a-e82a0e137b5e";

// Module-level cache: map instance and DOM survive unmount
let cachedMapEl: HTMLDivElement | null = null;
let cachedMapInstance: naver.maps.Map | null = null;
let cachedTheme: string | undefined = undefined;

function loadNaverMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve();
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
    if (!clientId) {
      reject(
        new Error("NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID가 설정되지 않았습니다"),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=gl`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("네이버 지도 스크립트 로딩 실패"));
    document.head.appendChild(script);
  });
}

export default function NaverMap({
  center = COMPANY_LOCATION,
  zoom = 15,
  onReady,
  className,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyCleanupRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const initMap = useCallback(
    (container: HTMLDivElement) => {
      if (cachedMapInstance) {
        cachedMapInstance.destroy();
        cachedMapInstance = null;
      }
      if (cachedMapEl) {
        cachedMapEl.remove();
      }

      cachedMapEl = document.createElement("div");
      cachedMapEl.style.cssText = "width:100%;height:100%";
      container.appendChild(cachedMapEl);

      const isDark = resolvedTheme === "dark";
      cachedMapInstance = new naver.maps.Map(cachedMapEl, {
        gl: true,
        center: new naver.maps.LatLng(center.lat, center.lng),
        zoom,
        customStyleId: isDark ? DARK_STYLE_ID : undefined,
      });

      cachedTheme = resolvedTheme;

      const idleListener = naver.maps.Event.addListener(
        cachedMapInstance,
        "idle",
        () => {
          naver.maps.Event.removeListener(idleListener);
          setReady(true);
        },
      );
    },
    [center.lat, center.lng, zoom, resolvedTheme],
  );

  // Mount: reattach cached DOM or create new map
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cache exists and theme matches — reattach instantly
    if (cachedMapEl && cachedMapInstance && cachedTheme === resolvedTheme) {
      container.appendChild(cachedMapEl);
      cachedMapInstance.autoResize();
      cachedMapInstance.setCenter(
        new naver.maps.LatLng(center.lat, center.lng),
      );
      cachedMapInstance.setZoom(zoom);
      setReady(true);

      return () => {
        onReadyCleanupRef.current?.();
        onReadyCleanupRef.current = null;
        cachedMapEl?.remove();
        setReady(false);
      };
    }

    // No cache or theme changed — load script and create map
    let mounted = true;

    loadNaverMapsScript()
      .then(() => {
        if (mounted) initMap(container);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
      onReadyCleanupRef.current?.();
      onReadyCleanupRef.current = null;
      cachedMapEl?.remove();
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme change while mounted — recreate map
  useEffect(() => {
    if (!cachedMapInstance || !containerRef.current) return;
    if (cachedTheme === resolvedTheme) return;
    onReadyCleanupRef.current?.();
    onReadyCleanupRef.current = null;
    setReady(false);
    initMap(containerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  // Invoke onReady callback when map is ready
  useEffect(() => {
    if (!ready || !cachedMapInstance || !onReady) return;

    onReadyCleanupRef.current?.();
    const cleanup = onReady(cachedMapInstance);
    onReadyCleanupRef.current = cleanup ?? null;
  }, [ready, onReady]);

  if (error) {
    return (
      <div className={className}>
        <div className="flex h-full items-center justify-center rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
