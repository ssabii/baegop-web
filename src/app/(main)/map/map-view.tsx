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

const MARKER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));cursor:pointer;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="var(--background)"/></svg>`;

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
  openInfoWindowId?: string | null;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export function MapView({
  markers,
  fitBounds,
  openInfoWindowId,
  onMarkerClick,
  className,
}: MapViewProps) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerInstancesRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const markersRef = useRef(markers);
  markersRef.current = markers;

  const clearMarkers = useCallback(() => {
    markerInstancesRef.current.forEach((m) => m.setMap(null));
    markerInstancesRef.current = [];
    infoWindowRef.current?.close();
  }, []);

  const openInfoWindow = useCallback(
    (map: naver.maps.Map, marker: naver.maps.Marker, data: MapMarker) => {
      const infoWindow = infoWindowRef.current;
      if (!infoWindow) return;

      const categoryText = data.category
        ? (data.category.split(">").pop()?.trim() ?? "")
        : "";

      const tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="var(--muted-foreground)"/></svg>`;

      const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`;

      infoWindow.setContent(`
        <a href="/places/${data.id}" style="display:block;text-decoration:none;cursor:pointer;">
          <div style="padding:10px 14px;background:var(--background);border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:nowrap;">
            <div style="display:flex;align-items:center;gap:4px;font-size:14px;font-weight:700;color:var(--foreground);"><span>${data.title ?? ""}</span>${externalLinkIcon}</div>
            ${categoryText ? `<div style="display:flex;align-items:center;gap:4px;margin-top:3px;">${tagIcon}<span style="font-size:12px;font-weight:500;color:var(--muted-foreground);">${categoryText}</span></div>` : ""}
          </div>
          <div style="display:flex;justify-content:center;"><svg width="12" height="6" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,0.08));"><polygon points="0,0 12,0 6,6" fill="var(--background)"/></svg></div>
        </a>
      `);
      infoWindow.open(map, marker);
    },
    [],
  );

  const renderMarkers = useCallback(
    (map: naver.maps.Map) => {
      clearMarkers();

      markers.forEach((data) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(data.lat, data.lng),
          map,
          title: data.title,
          icon: {
            content: MARKER_ICON,
            size: new naver.maps.Size(16, 16),
            anchor: new naver.maps.Point(8, 16),
          },
        });

        naver.maps.Event.addListener(marker, "click", () => {
          openInfoWindow(map, marker, data);
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
        map.fitBounds(bounds, { top: 80, bottom: 180, left: 40, right: 40 });
      }
    },
    [markers, fitBounds, onMarkerClick, clearMarkers, openInfoWindow],
  );

  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;

      const infoWindow = new naver.maps.InfoWindow({
        content: "",
        borderWidth: 0,
        backgroundColor: "transparent",
        disableAnchor: true,
        pixelOffset: new naver.maps.Point(0, -8),
      });
      infoWindowRef.current = infoWindow;

      naver.maps.Event.addListener(map, "click", () => {
        infoWindow.close();
      });

      renderMarkers(map);

      return () => {
        clearMarkers();
        mapRef.current = null;
        infoWindowRef.current = null;
      };
    },
    [renderMarkers, clearMarkers],
  );

  // Re-render markers when they change (after initial mount)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !infoWindowRef.current) return;
    renderMarkers(map);
  }, [renderMarkers]);

  // Open InfoWindow programmatically
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !openInfoWindowId) return;

    const idx = markersRef.current.findIndex((m) => m.id === openInfoWindowId);
    if (idx < 0) return;

    const markerInstance = markerInstancesRef.current[idx];
    const data = markersRef.current[idx];
    if (!markerInstance || !data) return;

    openInfoWindow(map, markerInstance, data);
    map.morph(markerInstance.getPosition(), 17);
  }, [openInfoWindowId, openInfoWindow]);

  return <NaverMap onReady={handleReady} className={className} />;
}
