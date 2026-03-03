"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  DUBAI_COOKIE_STORES,
  type DubaiCookieStore,
} from "@/data/dubai-cookie-stores";
import { createMarkerClustering } from "@/lib/marker-clustering";
import { calculateDistance } from "@/lib/geo";
import { useGeolocation } from "@/hooks/use-geolocation";
import { DubaiCookieSearchInput } from "./dubai-cookie-search-input";
import { LocationButton } from "./location-button";
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

function getSheetBottom(snap: number | string): string {
  if (typeof snap === "string") return snap; // "200px"
  return `${snap * 100}%`; // 0.3 → "30%", 0.5 → "50%"
}

export function DubaiCookieMap() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") ?? "";
  const placeParam = searchParams.get("place") ?? "";

  const [sheetSnap, setSheetSnap] = useState<number | string>(0.5);

  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const clusterCleanupRef = useRef<(() => void) | null>(null);
  const locationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const initialCenteredRef = useRef(false);
  const mapReadyRef = useRef(false);

  // Refs for stable access in map event handlers (avoid stale closures)
  const queryParamRef = useRef(queryParam);
  const placeParamRef = useRef(placeParam);
  useEffect(() => {
    queryParamRef.current = queryParam;
    placeParamRef.current = placeParam;
  }, [queryParam, placeParam]);

  const userCoords = useGeolocation();

  // Filter stores by query
  const filteredStores = useMemo(() => {
    if (!queryParam) return DUBAI_COOKIE_STORES;
    const q = queryParam.toLowerCase();
    return DUBAI_COOKIE_STORES.filter((s) => s.name.toLowerCase().includes(q));
  }, [queryParam]);

  // Sort by distance if user coords available
  const sortedStores = useMemo(() => {
    if (!userCoords) return filteredStores;
    return [...filteredStores].sort(
      (a, b) =>
        calculateDistance(userCoords, { lat: a.lat, lng: a.lng }) -
        calculateDistance(userCoords, { lat: b.lat, lng: b.lng }),
    );
  }, [filteredStores, userCoords]);

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

  const handleSearch = useCallback(
    (query: string) => {
      router.push(buildUrl({ query }), { scroll: false });
    },
    [router, buildUrl],
  );

  const handleSearchClear = useCallback(() => {
    router.replace("/map/dubaicookie", { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectStore = useCallback(
    (store: DubaiCookieStore) => {
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

  // Center on user location once
  useEffect(() => {
    if (!userCoords || !mapRef.current || initialCenteredRef.current) return;
    initialCenteredRef.current = true;
    mapRef.current.setCenter(
      new naver.maps.LatLng(userCoords.lat, userCoords.lng),
    );
  }, [userCoords]);

  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;
      mapReadyRef.current = true;

      naver.maps.Event.addListener(map, "click", () => {
        if (placeParamRef.current) {
          router.back();
        }
      });

      createMarkers(mapStores);
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

  return (
    <>
      <NaverMap onReady={handleReady} className="fixed inset-0" />

      <DubaiCookieSearchInput
        onBack={handleBack}
        onSearch={handleSearch}
        onClear={handleSearchClear}
        initialQuery={queryParam}
      />

      {/* <div
        className={cn("absolute right-4 z-42 transition-all duration-300", {
          "pointer-events-none opacity-0": sheetSnap === 1,
        })}
        style={{ bottom: `calc(${getSheetBottom(sheetSnap)} + 16px)` }}
      >
        <LocationButton onLocate={handleLocate} />
      </div> */}

      {showList && (
        <StoreListSheet
          stores={sortedStores}
          onSelectStore={handleSelectStore}
          onClose={isSearching ? handleCloseList : handleBack}
          onSnapChange={setSheetSnap}
        />
      )}

      {selectedStore && (
        <StoreDrawer
          key={selectedStore.placeId}
          store={selectedStore}
          onClose={handleCloseDetail}
          onSnapChange={setSheetSnap}
        />
      )}
    </>
  );
}
