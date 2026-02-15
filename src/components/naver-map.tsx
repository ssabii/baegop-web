"use client";

import { useEffect, useRef, useState } from "react";
import { COMPANY_LOCATION } from "@/lib/constants";

interface Marker {
  lat: number;
  lng: number;
  title?: string;
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
      reject(new Error("NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID가 설정되지 않았습니다"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
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
  const markerInstancesRef = useRef<any[]>([]);
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
    if (!map) return;

    // Clear existing markers
    markerInstancesRef.current.forEach((m: { setMap: (v: null) => void }) =>
      m.setMap(null)
    );
    markerInstancesRef.current = [];

    // Add new markers
    const { naver } = window;
    markers.forEach(({ lat, lng, title }) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map,
        title,
      });
      markerInstancesRef.current.push(marker);
    });
  }, [markers]);

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
