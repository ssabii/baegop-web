"use client";

import { useEffect, useRef, useState } from "react";
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

/* eslint-disable @typescript-eslint/no-explicit-any */
interface NaverMapsSDK {
  maps: {
    Map: new (el: HTMLElement, opts: any) => any;
    LatLng: new (lat: number, lng: number) => any;
    Marker: new (opts: any) => any;
    InfoWindow: new (opts: any) => any;
    Size: new (w: number, h: number) => any;
    Point: new (x: number, y: number) => any;
    Event: {
      addListener: (
        target: any,
        event: string,
        handler: (...args: any[]) => void,
      ) => any;
      removeListener: (listener: any) => void;
    };
  };
}

declare global {
  interface Window {
    naver: NaverMapsSDK;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoWindowRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerInstancesRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    let mounted = true;

    loadNaverMapsScript()
      .then(() => {
        if (!mounted || !mapRef.current) return;

        const { naver } = window;
        const map = new naver.maps.Map(mapRef.current, {
          center: new naver.maps.LatLng(center.lat, center.lng),
          zoom,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new naver.maps.InfoWindow({
          borderWidth: 0,
          backgroundColor: "transparent",
          disableAnchor: true,
          pixelOffset: new naver.maps.Point(0, -8),
        });

        // 지도 클릭 시 InfoWindow 닫기
        naver.maps.Event.addListener(map, "click", () => {
          infoWindowRef.current?.close();
        });

        setReady(true);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center & zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { naver } = window;
    map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
    map.setZoom(zoom);
  }, [center.lat, center.lng, zoom]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!ready || !map) return;

    // Clear existing markers
    markerInstancesRef.current.forEach((m: { setMap: (v: null) => void }) =>
      m.setMap(null),
    );
    markerInstancesRef.current = [];

    // Add new markers with custom baegop icon
    const { naver } = window;
    const infoWindow = infoWindowRef.current;

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

          const tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#868E96" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="#868E96"/></svg>`;

          infoWindow.setContent(`
            <a href="/places/${id}" style="display:block;text-decoration:none;cursor:pointer;">
              <div style="padding:10px 14px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:nowrap;">
                <div style="font-size:14px;font-weight:700;color:#212529;">${title ?? ""}</div>
                ${categoryText ? `<div style="display:flex;align-items:center;gap:4px;margin-top:3px;">${tagIcon}<span style="font-size:12px;font-weight:500;color:#868E96;">${categoryText}</span></div>` : ""}
              </div>
              <div style="display:flex;justify-content:center;"><svg width="12" height="6" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,0.08));"><polygon points="0,0 12,0 6,6" fill="#fff"/></svg></div>
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

  return <div ref={mapRef} className={className} />;
}
