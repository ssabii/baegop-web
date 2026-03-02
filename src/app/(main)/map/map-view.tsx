"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { COMPANY_LOCATION } from "@/lib/constants";
import { cn } from "@/lib/utils";
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
    ? `<div style="font-size:11px;font-weight:700;white-space:nowrap;text-align:center;color:var(--foreground);text-shadow:0 0 3px var(--background),0 0 3px var(--background),0 0 3px var(--background);max-width:120px;overflow:hidden;text-overflow:ellipsis;">${title}</div>`
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

type Padding = { top?: number; bottom?: number; left?: number; right?: number };

interface MapViewProps {
  markers: MapMarker[];
  fitBoundsPadding?: Padding;
  focusPadding?: Padding;
  focusMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export function MapView({
  markers,
  fitBoundsPadding,
  focusPadding,
  focusMarkerId,
  onMarkerClick,
  className,
}: MapViewProps) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerInstancesRef = useRef<naver.maps.Marker[]>([]);
  const markersRef = useRef(markers);
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  const clearMarkers = useCallback(() => {
    markerInstancesRef.current.forEach((m) => {
      naver.maps.Event.clearInstanceListeners(m);
      m.setMap(null);
    });
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

      if (fitBoundsPadding && markers.length > 0) {
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
        map.fitBounds(bounds, fitBoundsPadding);
      }
    },
    [markers, fitBoundsPadding, onMarkerClick, clearMarkers],
  );

  // Stable handleReady — only depends on clearMarkers (stable)
  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;
      setMapReady(true);

      return () => {
        clearMarkers();
        mapRef.current = null;
      };
    },
    [clearMarkers],
  );

  // Render markers when they change or when map becomes ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    renderMarkers(map);
  }, [renderMarkers, mapReady]);

  // Focus marker: fitBounds with padding, or morph fallback
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusMarkerId) return;

    const idx = markersRef.current.findIndex((m) => m.id === focusMarkerId);
    if (idx < 0) return;

    const markerInstance = markerInstancesRef.current[idx];
    if (!markerInstance) return;

    const target = markerInstance.getPosition();

    if (focusPadding) {
      const topPad = focusPadding.top ?? 0;
      const bottomPad = focusPadding.bottom ?? 0;
      const offsetY = (bottomPad - topPad) / 2;

      function calcAdjustedCenter(m: naver.maps.Map) {
        const proj = m.getProjection();
        const targetPoint = proj.fromCoordToOffset(target);
        return proj.fromOffsetToCoord(
          new naver.maps.Point(targetPoint.x, targetPoint.y + offsetY),
        );
      }

      const center = map.getCenter();
      const dx =
        (center as naver.maps.LatLng).lng() -
        (target as naver.maps.LatLng).lng();
      const dy =
        (center as naver.maps.LatLng).lat() -
        (target as naver.maps.LatLng).lat();
      const isFar = Math.sqrt(dx * dx + dy * dy) > 0.01; // ~1km

      if (isFar) {
        const latLng = target as naver.maps.LatLng;
        const bounds = new naver.maps.LatLngBounds(latLng, latLng);
        map.fitBounds(bounds, focusPadding);
        console.log(map.getZoom());
        if (map.getZoom() > 15) map.setZoom(15);
        return;
      }

      map.morph(calcAdjustedCenter(map), map.getZoom(), {
        easing: "easeOutCubic",
      });
      return;
    }

    // focusPadding 없으면 기존 morph 로직
    const center = map.getCenter();
    const dx =
      (center as naver.maps.LatLng).lng() - (target as naver.maps.LatLng).lng();
    const dy =
      (center as naver.maps.LatLng).lat() - (target as naver.maps.LatLng).lat();
    const isFar = Math.sqrt(dx * dx + dy * dy) > 0.01; // ~1km

    map.stop();

    let idleListener: naver.maps.MapEventListener | undefined;

    if (isFar) {
      map.setCenter(target);
      map.setZoom(15);
      idleListener = naver.maps.Event.addListener(map, "idle", () => {
        naver.maps.Event.removeListener(idleListener!);
        idleListener = undefined;
        map.morph(target, 17, { easing: "easeOutCubic", duration: 300 });
      });
    } else {
      map.morph(target, 17, { easing: "easeOutCubic" });
    }

    return () => {
      if (idleListener) naver.maps.Event.removeListener(idleListener);
    };
  }, [focusMarkerId, focusPadding, mapReady]);

  function handleLocate() {
    const map = mapRef.current;
    if (!map) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const target = new naver.maps.LatLng(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        map.morph(target, 16, { easing: "easeOutCubic" });
      },
      () => {
        // Geolocation denied/failed → move to company
        const target = new naver.maps.LatLng(
          COMPANY_LOCATION.lat,
          COMPANY_LOCATION.lng,
        );
        map.morph(target, 16, { easing: "easeOutCubic" });
      },
    );
  }

  return (
    <div className={cn("relative", className)}>
      <NaverMap onReady={handleReady} className="size-full" />
      <button
        type="button"
        onClick={handleLocate}
        className="absolute right-4 bottom-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
        aria-label="현재 위치"
      >
        <LocateFixed className="size-5 text-foreground" />
      </button>
    </div>
  );
}
