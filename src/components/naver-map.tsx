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

const LIGHT_COLORS = { bg: "#fff", text: "#212529", sub: "#868E96", arrow: "#fff" };
const DARK_COLORS = { bg: "#2a2a3d", text: "#f5f5f5", sub: "#a0a0b0", arrow: "#2a2a3d" };

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const markerInstancesRef = useRef<naver.maps.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const createMap = useCallback(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    }

    const isDark = resolvedTheme === "dark";
    const map = new naver.maps.Map(mapRef.current, {
      gl: true,
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom,
      customStyleId: isDark ? DARK_STYLE_ID : undefined,
    });

    mapInstanceRef.current = map;

    infoWindowRef.current = new naver.maps.InfoWindow({
      content: "",
      borderWidth: 0,
      backgroundColor: "transparent",
      disableAnchor: true,
      pixelOffset: new naver.maps.Point(0, -8),
    });

    naver.maps.Event.addListener(map, "click", () => {
      infoWindowRef.current?.close();
    });

    setReady(true);
  }, [center.lat, center.lng, zoom, resolvedTheme]);

  // Initialize script + create map
  useEffect(() => {
    let mounted = true;

    loadNaverMapsScript()
      .then(() => {
        if (!mounted) return;
        createMap();
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recreate map on theme change (after initial load)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    createMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!ready || !map) return;

    markerInstancesRef.current.forEach((m) => m.setMap(null));
    markerInstancesRef.current = [];

    const infoWindow = infoWindowRef.current;
    const isDark = resolvedTheme === "dark";
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

    markers.forEach(({ id, lat, lng, title, category }) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map,
        title,
        icon: {
          content: `<img src="/baegop.svg" alt="" width="16" height="16" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));cursor:pointer;" />`,
          size: new naver.maps.Size(28, 28),
          anchor: new naver.maps.Point(14, 14),
        },
      });

      if (infoWindow) {
        naver.maps.Event.addListener(marker, "click", () => {
          const categoryText = category
            ? (category.split(">").pop()?.trim() ?? "")
            : "";

          const tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${colors.sub}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="${colors.sub}"/></svg>`;

          infoWindow.setContent(`
            <a href="/places/${id}" style="display:block;text-decoration:none;cursor:pointer;">
              <div style="padding:10px 14px;background:${colors.bg};border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:nowrap;">
                <div style="font-size:14px;font-weight:700;color:${colors.text};">${title ?? ""}</div>
                ${categoryText ? `<div style="display:flex;align-items:center;gap:4px;margin-top:3px;">${tagIcon}<span style="font-size:12px;font-weight:500;color:${colors.sub};">${categoryText}</span></div>` : ""}
              </div>
              <div style="display:flex;justify-content:center;"><svg width="12" height="6" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,0.08));"><polygon points="0,0 12,0 6,6" fill="${colors.arrow}"/></svg></div>
            </a>
          `);
          infoWindow.open(map, marker);
        });
      }

      markerInstancesRef.current.push(marker);
    });
  }, [ready, markers, resolvedTheme]);

  if (error) {
    return (
      <div className={className}>
        <div className="flex h-full items-center justify-center rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
}
