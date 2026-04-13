"use client";

import { useEffect, useRef, useState, useCallback, useContext } from "react";
import { useTheme } from "next-themes";
import { NaverMapContext } from "./NaverMapContext";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onReady?: () => void;
  onLoaded?: () => void;
  className?: string;
}

const DARK_STYLE_ID = "94230366-adba-4e0e-ac5a-e82a0e137b5e";

// Module-level cache: map instance and DOM survive unmount
let cachedMapEl: HTMLDivElement | null = null;
let cachedMapInstance: naver.maps.Map | null = null;
let cachedTheme: string | undefined = undefined;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`스크립트 로딩 실패: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadNaverMapsScript(): Promise<void> {
  if (window.naver?.maps) return;

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID가 설정되지 않았습니다");
  }

  await loadScript(
    `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=gl`,
  );

  // MarkerClustering은 naver.maps.OverlayView를 상속하므로 순차 로딩
  if (!window.MarkerClustering) {
    await loadScript(
      "https://navermaps.github.io/maps.js.en/docs/js/MarkerClustering.js",
    );
  }
}

export default function NaverMap({
  center = DEFAULT_CENTER,
  zoom = 15,
  onReady,
  onLoaded,
  className,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const context = useContext(NaverMapContext);

  const onReadyRef = useRef(onReady);
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  const registerMap = useCallback(
    (map: naver.maps.Map) => {
      if (context) {
        context.mapRef.current = map;
      }
      onReadyRef.current?.();
    },
    [context],
  );

  const unregisterMap = useCallback(() => {
    if (context) {
      if (context.locationMarkerRef.current) {
        context.locationMarkerRef.current.setMap(null);
        context.locationMarkerRef.current = null;
      }
      context.mapRef.current = null;
    }
  }, [context]);

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
        logoControl: false,
        mapDataControl: false,
        scaleControl: false,
        zoomControl: false,
        mapTypeControl: false,
      });

      cachedTheme = resolvedTheme;

      registerMap(cachedMapInstance);

      const idleListener = naver.maps.Event.addListener(
        cachedMapInstance,
        "idle",
        () => {
          naver.maps.Event.removeListener(idleListener);
          onLoadedRef.current?.();
        },
      );
    },
    [center.lat, center.lng, zoom, resolvedTheme, registerMap],
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

      registerMap(cachedMapInstance);
      onLoadedRef.current?.();

      return () => {
        unregisterMap();
        cachedMapEl?.remove();
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
      unregisterMap();
      cachedMapEl?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme change while mounted — recreate map
  useEffect(() => {
    if (!cachedMapInstance || !containerRef.current) return;
    if (cachedTheme === resolvedTheme) return;
    unregisterMap();
    initMap(containerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

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
