"use client";

import { useCallback, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";

const NaverMap = dynamic(() => import("@/components/naver-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
      <Spinner className="size-8 text-primary" aria-label="로딩 중" />
    </div>
  ),
});

function createMarkerContent(title?: string): string {
  const pin = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));cursor:pointer;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="var(--background)"/></svg>`;
  const label = title
    ? `<div style="font-size:11px;font-weight:700;white-space:nowrap;text-align:center;color:var(--foreground);text-shadow:0 0 3px var(--background),0 0 3px var(--background),0 0 3px var(--background);max-width:80px;overflow:hidden;text-overflow:ellipsis;">${title}</div>`
    : "";
  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">${pin}${label}</div>`;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  category?: string | null;
}

interface MapViewProps {
  markers: MapMarker[];
  fitBounds?: boolean;
  focusMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export function MapView({
  markers,
  fitBounds,
  focusMarkerId,
  onMarkerClick,
  className,
}: MapViewProps) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerInstancesRef = useRef<naver.maps.Marker[]>([]);
  const markersRef = useRef(markers);
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  const clearMarkers = useCallback(() => {
    markerInstancesRef.current.forEach((m) => m.setMap(null));
    markerInstancesRef.current = [];
  }, []);

  const renderMarkers = useCallback(
    (map: naver.maps.Map) => {
      clearMarkers();

      markers.forEach((data) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(data.lat, data.lng),
          map,
          title: data.title,
          icon: {
            content: createMarkerContent(data.title),
            size: new naver.maps.Size(24, data.title ? 40 : 24),
            anchor: new naver.maps.Point(12, data.title ? 24 : 24),
          },
        });

        naver.maps.Event.addListener(marker, "click", () => {
          onMarkerClick?.(data.id);
        });

        markerInstancesRef.current.push(marker);
      });

      if (fitBounds && markers.length > 0) {
        const bounds = new naver.maps.LatLngBounds(
          new naver.maps.LatLng(
            Math.min(...markers.map((m) => m.lat)),
            Math.min(...markers.map((m) => m.lng)),
          ),
          new naver.maps.LatLng(
            Math.max(...markers.map((m) => m.lat)),
            Math.max(...markers.map((m) => m.lng)),
          ),
        );
        map.fitBounds(bounds, {
          top: 80,
          bottom: Math.round(window.innerHeight * 0.5),
          left: 40,
          right: 40,
        });
      }
    },
    [markers, fitBounds, onMarkerClick, clearMarkers],
  );

  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;
      renderMarkers(map);

      return () => {
        clearMarkers();
        mapRef.current = null;
      };
    },
    [renderMarkers, clearMarkers],
  );

  // Re-render markers when they change (after initial mount)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    renderMarkers(map);
  }, [renderMarkers]);

  // Focus marker: morph to position
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusMarkerId) return;

    const idx = markersRef.current.findIndex((m) => m.id === focusMarkerId);
    if (idx < 0) return;

    const markerInstance = markerInstancesRef.current[idx];
    if (!markerInstance) return;

    map.morph(markerInstance.getPosition(), 17);
  }, [focusMarkerId]);

  return <NaverMap onReady={handleReady} className={className} />;
}
