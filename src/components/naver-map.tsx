"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { COMPANY_LOCATION } from "@/lib/constants";

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  category?: string | null;
}

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  className?: string;
}

const DARK_STYLE_ID = "94230366-adba-4e0e-ac5a-e82a0e137b5e";

// Module-level cache: map instance and DOM survive unmount
let cachedMapEl: HTMLDivElement | null = null;
let cachedMapInstance: naver.maps.Map | null = null;
let cachedInfoWindow: naver.maps.InfoWindow | null = null;
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
  markers = [],
  className,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerInstancesRef = useRef<naver.maps.Marker[]>([]);
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

      cachedInfoWindow = new naver.maps.InfoWindow({
        content: "",
        borderWidth: 0,
        backgroundColor: "transparent",
        disableAnchor: true,
        pixelOffset: new naver.maps.Point(0, -8),
      });

      cachedTheme = resolvedTheme;

      naver.maps.Event.addListener(cachedMapInstance, "click", () => {
        cachedInfoWindow?.close();
      });

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
      setReady(true);

      return () => {
        markerInstancesRef.current.forEach((m) => m.setMap(null));
        markerInstancesRef.current = [];
        cachedInfoWindow?.close();
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
      markerInstancesRef.current.forEach((m) => m.setMap(null));
      markerInstancesRef.current = [];
      cachedInfoWindow?.close();
      cachedMapEl?.remove();
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme change while mounted — recreate map
  useEffect(() => {
    if (!cachedMapInstance || !containerRef.current) return;
    if (cachedTheme === resolvedTheme) return;
    setReady(false);
    initMap(containerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  // Update markers
  useEffect(() => {
    const map = cachedMapInstance;
    if (!ready || !map) return;

    markerInstancesRef.current.forEach((m) => m.setMap(null));
    markerInstancesRef.current = [];

    const infoWindow = cachedInfoWindow;

    markers.forEach(({ id, lat, lng, title, category }) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map,
        title,
        icon: {
          content: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));cursor:pointer;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="var(--background)"/></svg>`,
          size: new naver.maps.Size(16, 16),
          anchor: new naver.maps.Point(8, 16),
        },
      });

      if (infoWindow) {
        naver.maps.Event.addListener(marker, "click", () => {
          const categoryText = category
            ? (category.split(">").pop()?.trim() ?? "")
            : "";

          const tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="var(--muted-foreground)"/></svg>`;

          const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`;

          infoWindow.setContent(`
            <a href="/places/${id}" style="display:block;text-decoration:none;cursor:pointer;">
              <div style="padding:10px 14px;background:var(--background);border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:nowrap;">
                <div style="display:flex;align-items:center;gap:4px;font-size:14px;font-weight:700;color:var(--foreground);"><span>${title ?? ""}</span>${externalLinkIcon}</div>
                ${categoryText ? `<div style="display:flex;align-items:center;gap:4px;margin-top:3px;">${tagIcon}<span style="font-size:12px;font-weight:500;color:var(--muted-foreground);">${categoryText}</span></div>` : ""}
              </div>
              <div style="display:flex;justify-content:center;"><svg width="12" height="6" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,0.08));"><polygon points="0,0 12,0 6,6" fill="var(--background)"/></svg></div>
            </a>
          `);
          infoWindow.open(map, marker);
        });
      }

      markerInstancesRef.current.push(marker);
    });
  }, [ready, markers]);

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
