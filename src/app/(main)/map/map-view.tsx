"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { createMarkerClustering } from "@/lib/marker-clustering";
import { getOverlappingMarkers } from "@/lib/marker-overlap";
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
    ? `<div style="font-size:12px;font-weight:700;white-space:nowrap;text-align:center;color:var(--foreground);text-shadow:0 0 3px var(--background),0 0 3px var(--background),0 0 3px var(--background);max-width:120px;overflow:hidden;text-overflow:ellipsis;">${title}</div>`
    : "";
  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">${pin}${label}</div>`;
}

const CLUSTER_MAX_ZOOM = 15;

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  category?: string | null;
}

type Padding = { top?: number; bottom?: number; left?: number; right?: number };

export interface MapViewHandle {
  morphTo: (lat: number, lng: number, zoom: number) => void;
  getCenter: () => { lat: number; lng: number } | null;
}

interface MapViewProps {
  markers: MapMarker[];
  fitBoundsPadding?: Padding;
  focusPadding?: Padding;
  focusMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onOverlapClick?: (markers: MapMarker[], anchorPos: { x: number; y: number }) => void;
  onDragEnd?: () => void;
  onMapClick?: () => void;
  showLabels?: boolean;
  className?: string;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    markers,
    fitBoundsPadding,
    focusPadding,
    focusMarkerId,
    onMarkerClick,
    onOverlapClick,
    onDragEnd,
    onMapClick,
    showLabels = true,
    className,
  },
  ref,
) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerInstancesRef = useRef<naver.maps.Marker[]>([]);
  const clusterCleanupRef = useRef<(() => void) | null>(null);
  const markersRef = useRef(markers);
  const onDragEndRef = useRef(onDragEnd);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onOverlapClickRef = useRef(onOverlapClick);
  const onMapClickRef = useRef(onMapClick);
  const lastFitBoundsKeyRef = useRef("");
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);
  useEffect(() => {
    onDragEndRef.current = onDragEnd;
  }, [onDragEnd]);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);
  useEffect(() => {
    onOverlapClickRef.current = onOverlapClick;
  }, [onOverlapClick]);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const clearMarkers = useCallback(() => {
    clusterCleanupRef.current?.();
    clusterCleanupRef.current = null;
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
        const label = showLabels ? data.title : undefined;
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(data.lat, data.lng),
          title: data.title,
          icon: {
            content: createMarkerContent(label),
            size: new naver.maps.Size(24, label ? 40 : 24),
            anchor: new naver.maps.Point(12, label ? 24 : 24),
          },
        });

        naver.maps.Event.addListener(marker, "click", () => {
          const map = mapRef.current;
          if (!map) return;

          const overlapping = getOverlappingMarkers(
            map,
            marker,
            markerInstancesRef.current,
          );

          if (overlapping.length > 0 && onOverlapClickRef.current) {
            const allOverlapping = [marker, ...overlapping];
            const overlapItems = allOverlapping
              .map((m) => {
                const idx = markerInstancesRef.current.indexOf(m);
                return idx >= 0 ? markersRef.current[idx] : null;
              })
              .filter((item): item is MapMarker => item !== null);

            const el = marker.getElement();
            const rect = el?.getBoundingClientRect();
            const anchorPos = rect
              ? { x: rect.left + rect.width / 2, y: rect.top }
              : { x: 0, y: 0 };

            onOverlapClickRef.current(overlapItems, anchorPos);
          } else {
            onMarkerClickRef.current?.(data.id);
          }
        });

        markerInstancesRef.current.push(marker);
      });

      clusterCleanupRef.current = createMarkerClustering({
        map,
        markers: markerInstancesRef.current,
        gridSize: 120,
        minClusterSize: 2,
        clusterColors: { light: "#ee560c", dark: "#ee560c" },
        maxZoom: CLUSTER_MAX_ZOOM,
        onClusterClick: (cluster) => {
          map.fitBounds(
            cluster.getBounds(),
            fitBoundsPadding ?? {
              top: 80,
              right: 40,
              bottom: 40,
              left: 40,
            },
          );
          if (map.getZoom() > CLUSTER_MAX_ZOOM + 1) {
            map.setZoom(CLUSTER_MAX_ZOOM + 1);
          }
        },
      });

      if (fitBoundsPadding && markers.length > 0) {
        const key = markers.map((m) => m.id).join(",");
        if (key !== lastFitBoundsKeyRef.current) {
          lastFitBoundsKeyRef.current = key;
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
      }
    },
    [markers, fitBoundsPadding, showLabels, clearMarkers],
  );

  // Stable handleReady — only depends on clearMarkers (stable)
  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;
      setMapReady(true);

      let dragStartCenter: naver.maps.LatLng | null = null;

      const dragStartListener = naver.maps.Event.addListener(
        map,
        "dragstart",
        () => {
          dragStartCenter = map.getCenter() as naver.maps.LatLng;
        },
      );

      const dragEndListener = naver.maps.Event.addListener(
        map,
        "dragend",
        () => {
          const endCenter = map.getCenter() as naver.maps.LatLng;
          if (
            dragStartCenter &&
            (dragStartCenter.lat() !== endCenter.lat() ||
              dragStartCenter.lng() !== endCenter.lng())
          ) {
            onDragEndRef.current?.();
          }
          dragStartCenter = null;
        },
      );

      const clickListener = naver.maps.Event.addListener(map, "click", () => {
        onMapClickRef.current?.();
      });

      return () => {
        naver.maps.Event.removeListener(dragStartListener);
        naver.maps.Event.removeListener(dragEndListener);
        naver.maps.Event.removeListener(clickListener);
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
      const latLng = target as naver.maps.LatLng;
      const bounds = new naver.maps.LatLngBounds(latLng, latLng);
      map.fitBounds(bounds, focusPadding);
      if (map.getZoom() > 15) map.setZoom(15);
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

  useImperativeHandle(ref, () => ({
    morphTo(lat: number, lng: number, zoom: number) {
      const map = mapRef.current;
      if (!map) return;
      map.morph(new naver.maps.LatLng(lat, lng), zoom, {
        easing: "easeOutCubic",
      });
    },
    getCenter() {
      const map = mapRef.current;
      if (!map) return null;
      const center = map.getCenter() as naver.maps.LatLng;
      return { lat: center.lat(), lng: center.lng() };
    },
  }));

  return (
    <div className={cn("relative", className)}>
      <NaverMap onReady={handleReady} className="size-full" />
    </div>
  );
});
