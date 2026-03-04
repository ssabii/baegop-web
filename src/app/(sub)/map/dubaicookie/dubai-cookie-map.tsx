"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import {
  DUBAI_COOKIE_STORES,
  type DubaiCookieStore,
} from "@/data/dubai-cookie-stores";
import { COMPANY_LOCATION } from "@/lib/constants";
import { createMarkerClustering } from "@/lib/marker-clustering";
import { calculateDistance } from "@/lib/geo";
import { useGeolocation } from "@/hooks/use-geolocation";
import { DubaiCookieSearchInput } from "./dubai-cookie-search-input";
import { StoreDrawer } from "./store-drawer";
import { StoreListSheet } from "./store-list-sheet";

const NaverMap = dynamic(() => import("@/components/naver-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
      <Spinner className="size-8 text-primary" aria-label="로딩 중" />
    </div>
  ),
});

const CLUSTER_MAX_ZOOM = 15;

/** Pan (and optionally zoom) so the marker sits in the upper portion of the visible map */
function panToAboveSheet(
  map: naver.maps.Map,
  lat: number,
  lng: number,
  targetZoom?: number,
) {
  // If zoom changes, set it first so projection calculates the correct offset
  if (targetZoom !== undefined && map.getZoom() < targetZoom) {
    map.setZoom(targetZoom, false);
  }
  const proj = map.getProjection();
  const point = proj.fromCoordToOffset(new naver.maps.LatLng(lat, lng));
  // Bottom sheet covers ~50% of viewport. Shift pan target down by 10% so marker
  // appears centered in the top half of the screen.
  const offset = Math.round(window.innerHeight * 0.1);
  const shifted = proj.fromOffsetToCoord(
    new naver.maps.Point(point.x, point.y + offset),
  );
  map.panTo(shifted);
}

function createMarkerContent(name: string): string {
  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
  <img src="/dubai-cookie.svg" width="32" height="32" alt="" />
  <span style="font-size:12px;font-weight:600;color:var(--foreground);background:var(--background);padding:1px 4px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.15);max-width:120px;overflow:hidden;text-overflow:ellipsis;">${name}</span>
</div>`;
}

export function DubaiCookieMap() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") ?? "";
  const placeParam = searchParams.get("place") ?? "";

  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const clusterCleanupRef = useRef<(() => void) | null>(null);
  const locationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const mapReadyRef = useRef(false);

  const [mapMoved, setMapMoved] = useState(false);
  const [sortCenter, setSortCenter] = useState<
    { lat: number; lng: number } | undefined
  >();

  // Refs for stable access in map event handlers (avoid stale closures)
  const queryParamRef = useRef(queryParam);
  queryParamRef.current = queryParam;
  const placeParamRef = useRef(placeParam);
  placeParamRef.current = placeParam;

  const { coords: userCoords, loading: geoLoading } = useGeolocation();
  const mapCenter = userCoords ?? COMPANY_LOCATION;

  // Filter stores by query
  const filteredStores = useMemo(() => {
    if (!queryParam) return DUBAI_COOKIE_STORES;
    const q = queryParam.toLowerCase();
    return DUBAI_COOKIE_STORES.filter((s) => s.name.toLowerCase().includes(q));
  }, [queryParam]);

  // Sort by distance from effective center (sortCenter if user searched in map, else user coords)
  const effectiveSortCenter = sortCenter ?? userCoords;
  const sortedStores = useMemo(() => {
    if (!effectiveSortCenter) return filteredStores;
    return [...filteredStores].sort(
      (a, b) =>
        calculateDistance(effectiveSortCenter, { lat: a.lat, lng: a.lng }) -
        calculateDistance(effectiveSortCenter, { lat: b.lat, lng: b.lng }),
    );
  }, [filteredStores, effectiveSortCenter]);

  // If place param is set, find the selected store
  const selectedStore = useMemo(() => {
    if (!placeParam) return null;
    return DUBAI_COOKIE_STORES.find((s) => s.placeId === placeParam) ?? null;
  }, [placeParam]);

  // Stores to show on map: if detail view, only selected; otherwise filtered
  const mapStores = useMemo(() => {
    if (selectedStore) return [selectedStore];
    return filteredStores;
  }, [selectedStore, filteredStores]);

  // --- URL helpers ---
  const buildUrl = useCallback(
    (params: { query?: string; place?: string; expand?: string }) => {
      const sp = new URLSearchParams();
      if (params.query) sp.set("query", params.query);
      if (params.place) sp.set("place", params.place);
      if (params.expand) sp.set("expand", params.expand);
      const qs = sp.toString();
      return qs ? `/map/dubaicookie?${qs}` : "/map/dubaicookie";
    },
    [],
  );

  const handleSearchTap = useCallback(() => {
    const url = queryParam
      ? `/search/dubai-cookie?query=${encodeURIComponent(queryParam)}`
      : "/search/dubai-cookie";
    router.push(url);
  }, [router, queryParam]);

  const handleSearchClear = useCallback(() => {
    setMapMoved(false);
    setSortCenter(undefined);
    router.replace("/map/dubaicookie", { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectStore = useCallback(
    (store: DubaiCookieStore) => {
      setMapMoved(false);
      const url = buildUrl({
        query: queryParam || undefined,
        place: store.placeId,
      });
      if (placeParam) {
        // detail → detail: replace
        router.replace(url, { scroll: false });
      } else {
        // list → detail: push
        router.push(url, { scroll: false });
      }
      if (mapRef.current) {
        panToAboveSheet(
          mapRef.current,
          store.lat,
          store.lng,
          CLUSTER_MAX_ZOOM + 1,
        );
      }
    },
    [router, buildUrl, queryParam, placeParam],
  );

  const handleCloseDetail = useCallback(() => {
    router.back();
  }, [router]);

  const handleCloseList = useCallback(() => {
    router.replace("/map/dubaicookie", { scroll: false });
  }, [router]);

  const handleSearchInMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter() as naver.maps.LatLng;
    setSortCenter({ lat: center.lat(), lng: center.lng() });
    setMapMoved(false);
  }, []);

  // --- Marker management ---
  const createMarkers = useCallback(
    (stores: DubaiCookieStore[]) => {
      const map = mapRef.current;
      if (!map) return;

      // Cleanup existing
      clusterCleanupRef.current?.();
      clusterCleanupRef.current = null;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const markers: naver.maps.Marker[] = [];

      stores.forEach((store) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(store.lat, store.lng),
          title: store.name,
          icon: {
            content: createMarkerContent(store.name),
            size: new naver.maps.Size(80, 48),
            anchor: new naver.maps.Point(40, 24),
          },
        });

        naver.maps.Event.addListener(marker, "click", () => {
          const url = buildUrl({
            query: queryParamRef.current || undefined,
            place: store.placeId,
          });
          if (placeParamRef.current) {
            router.replace(url, { scroll: false });
          } else {
            router.push(url, { scroll: false });
          }
          panToAboveSheet(map, store.lat, store.lng);
        });

        markers.push(marker);
      });

      markersRef.current = markers;

      clusterCleanupRef.current = createMarkerClustering({
        map,
        markers,
        gridSize: 120,
        minClusterSize: 2,
        maxZoom: CLUSTER_MAX_ZOOM,
        clusterColors: { light: "#B0CC50", dark: "#8EB035" },
        onClusterClick: (cluster) => {
          map.fitBounds(cluster.getBounds(), {
            top: 80,
            right: 40,
            bottom: Math.round(window.innerHeight * 0.5) + 40,
            left: 40,
          });
          // Cap zoom to prevent over-zooming when markers overlap
          if (map.getZoom() > CLUSTER_MAX_ZOOM + 1) {
            map.setZoom(CLUSTER_MAX_ZOOM + 1);
          }
        },
      });
    },
    [buildUrl, router],
  );

  // Recreate markers when mapStores change (after map is ready)
  useEffect(() => {
    if (!mapReadyRef.current) return;
    createMarkers(mapStores);
  }, [mapStores, createMarkers]);

  // Fit bounds to search results when query changes
  const prevQueryRef = useRef(queryParam);
  useEffect(() => {
    if (prevQueryRef.current === queryParam) return;
    prevQueryRef.current = queryParam;
    setMapMoved(false);
    setSortCenter(undefined);

    const map = mapRef.current;
    if (!map || !queryParam || filteredStores.length === 0) return;

    if (filteredStores.length === 1) {
      panToAboveSheet(map, filteredStores[0].lat, filteredStores[0].lng);
      map.setZoom(CLUSTER_MAX_ZOOM + 1);
      return;
    }

    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(filteredStores[0].lat, filteredStores[0].lng),
      new naver.maps.LatLng(filteredStores[0].lat, filteredStores[0].lng),
    );
    for (const s of filteredStores) {
      bounds.extend(new naver.maps.LatLng(s.lat, s.lng));
    }
    map.fitBounds(bounds, {
      top: 80,
      right: 40,
      bottom: Math.round(window.innerHeight * 0.5) + 40,
      left: 40,
    });
  }, [queryParam, filteredStores]);

  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;
      mapReadyRef.current = true;

      const clickListener = naver.maps.Event.addListener(map, "click", () => {
        if (placeParamRef.current) {
          router.back();
        }
      });

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
            setMapMoved(true);
          }
          dragStartCenter = null;
        },
      );

      createMarkers(mapStores);

      // Cleanup on unmount — remove markers, clusters, listeners
      return () => {
        naver.maps.Event.removeListener(clickListener);
        naver.maps.Event.removeListener(dragStartListener);
        naver.maps.Event.removeListener(dragEndListener);
        clusterCleanupRef.current?.();
        clusterCleanupRef.current = null;
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        mapReadyRef.current = false;
      };
    },
    [createMarkers, mapStores, router],
  );

  const handleLocate = useCallback((position: { lat: number; lng: number }) => {
    const map = mapRef.current;
    if (!map) return;

    const latlng = new naver.maps.LatLng(position.lat, position.lng);
    map.morph(latlng, 16, { easing: "easeOutCubic" });

    if (locationMarkerRef.current) {
      locationMarkerRef.current.setPosition(latlng);
    } else {
      locationMarkerRef.current = new naver.maps.Marker({
        position: latlng,
        map,
        icon: {
          content: `<div style="width:16px;height:16px;border-radius:50%;background:#4285F4;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
          size: new naver.maps.Size(16, 16),
          anchor: new naver.maps.Point(8, 8),
        },
        zIndex: 100,
      });
    }
  }, []);

  // UI state
  const isSearching = !!queryParam;
  const showList = !selectedStore;

  if (geoLoading) {
    return (
      <div className="relative flex-1">
        <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
          <Spinner className="size-8 text-primary" aria-label="로딩 중" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <NaverMap
        center={mapCenter}
        onReady={handleReady}
        className="size-full"
      />

      <DubaiCookieSearchInput
        query={queryParam}
        onTap={handleSearchTap}
        onClear={handleSearchClear}
        onBack={handleBack}
      />

      {showList && (
        <StoreListSheet
          stores={sortedStores}
          onSelectStore={handleSelectStore}
          onClose={isSearching ? handleCloseList : handleBack}
          onLocate={handleLocate}
          showSearchInMap={mapMoved}
          onSearchInMap={handleSearchInMap}
        />
      )}

      {selectedStore && (
        <StoreDrawer
          store={selectedStore}
          onClose={handleCloseDetail}
          onLocate={handleLocate}
        />
      )}
    </div>
  );
}
