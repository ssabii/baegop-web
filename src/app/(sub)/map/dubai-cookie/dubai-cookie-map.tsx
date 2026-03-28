"use client";

import { Spinner } from "@/components/ui/spinner";
import {
  DUBAI_COOKIE_STORES,
  type DubaiCookieStore,
} from "@/data/dubai-cookie-stores";
import { useGeolocation } from "@/hooks/use-geolocation";
import { COMPANY_LOCATION } from "@/lib/constants";
import {
  MapOverlapPopover,
  type OverlapMarkerItem,
} from "@/components/map-overlap-popover";
import { calculateDistance } from "@/lib/geo";
import { createMarkerClustering } from "@/lib/marker-clustering";
import { getOverlappingMarkers } from "@/lib/marker-overlap";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const CLUSTER_MAX_ZOOM = 16;

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

  const [overlapState, setOverlapState] = useState<{
    items: OverlapMarkerItem[];
    anchorPos: { x: number; y: number };
  } | null>(null);

  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const clusterCleanupRef = useRef<(() => void) | null>(null);
  const locationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const mapReadyRef = useRef(false);

  // Refs for stable access in map event handlers (avoid stale closures)
  const queryParamRef = useRef(queryParam);
  const placeParamRef = useRef(placeParam);
  useEffect(() => {
    queryParamRef.current = queryParam;
    placeParamRef.current = placeParam;
  }, [queryParam, placeParam]);

  const { coords: userCoords, loading: geoLoading } = useGeolocation();
  const initialCenter = userCoords ?? COMPANY_LOCATION;

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
      return qs ? `/map/dubai-cookie?${qs}` : "/map/dubai-cookie";
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
    router.replace("/map/dubai-cookie", { scroll: false });
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
        const map = mapRef.current;
        const bounds = map.getBounds() as naver.maps.LatLngBounds;
        const storeLatLng = new naver.maps.LatLng(store.lat, store.lng);
        const currentZoom = map.getZoom();
        const needsZoom = currentZoom < 15;

        let isVisible = bounds.hasLatLng(storeLatLng);
        if (isVisible) {
          const sw = bounds.getSW();
          const ne = bounds.getNE();
          const mapHeight = map.getSize().height;
          const sheetOffset = Math.round(window.innerHeight * 0.5);
          const latPerPixel = (ne.lat() - sw.lat()) / mapHeight;
          isVisible = store.lat > sw.lat() + latPerPixel * sheetOffset;
        }

        if (!isVisible || needsZoom) {
          const targetZoom = needsZoom ? CLUSTER_MAX_ZOOM + 1 : undefined;
          panToAboveSheet(map, store.lat, store.lng, targetZoom);
        }
      }
    },
    [router, buildUrl, queryParam, placeParam],
  );

  const handleCloseDetail = useCallback(() => {
    router.back();
  }, [router]);

  const handleCloseList = useCallback(() => {
    router.replace("/map/dubai-cookie", { scroll: false });
  }, [router]);

  const handleOverlapSelect = useCallback(
    (id: string) => {
      setOverlapState(null);
      const store = DUBAI_COOKIE_STORES.find((s) => s.placeId === id);
      if (store) handleSelectStore(store);
    },
    [handleSelectStore],
  );

  const handleOverlapClose = useCallback(() => {
    setOverlapState(null);
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
          const overlapping = getOverlappingMarkers(
            map,
            marker,
            markers,
          );

          if (overlapping.length > 0) {
            const allOverlapping = [marker, ...overlapping];
            const overlapItems = allOverlapping
              .map((m) => {
                const idx = markers.indexOf(m);
                if (idx < 0) return null;
                const s = stores[idx];
                return {
                  id: s.placeId,
                  title: s.name,
                  category: s.category,
                };
              })
              .filter(
                (item): item is NonNullable<typeof item> => item !== null,
              );

            const el = marker.getElement();
            const rect = el?.getBoundingClientRect();
            const anchorPos = rect
              ? { x: rect.left + rect.width / 2, y: rect.top }
              : { x: 0, y: 0 };

            setOverlapState({ items: overlapItems, anchorPos });
          } else {
            setOverlapState(null);
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
          }
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

  // fitBounds to nearby search results (Naver Maps style)
  const prevQueryRef = useRef(queryParam);
  useEffect(() => {
    if (prevQueryRef.current === queryParam) return;
    prevQueryRef.current = queryParam;

    const map = mapRef.current;
    if (!map || !queryParam || sortedStores.length === 0) return;

    // sortedStores is already sorted by distance from userCoords
    const nearby = sortedStores
      .filter(
        (s) =>
          !userCoords ||
          calculateDistance(userCoords, { lat: s.lat, lng: s.lng }) <= 5000,
      )
      .slice(0, 5);

    if (nearby.length === 0) return;

    // Check if all nearby stores are already visible
    const bounds = map.getBounds() as naver.maps.LatLngBounds;
    const sw = bounds.getSW();
    const ne = bounds.getNE();
    const mapHeight = map.getSize().height;
    const sheetOffset = Math.round(window.innerHeight * 0.5);
    const latPerPixel = (ne.lat() - sw.lat()) / mapHeight;
    const adjustedSouthLat = sw.lat() + latPerPixel * sheetOffset;

    const allVisible = nearby.every((s) => {
      const ll = new naver.maps.LatLng(s.lat, s.lng);
      return bounds.hasLatLng(ll) && s.lat > adjustedSouthLat;
    });

    if (!allVisible) {
      const fitBounds = new naver.maps.LatLngBounds(
        new naver.maps.LatLng(nearby[0].lat, nearby[0].lng),
        new naver.maps.LatLng(nearby[0].lat, nearby[0].lng),
      );
      for (const s of nearby) {
        fitBounds.extend(new naver.maps.LatLng(s.lat, s.lng));
      }
      map.fitBounds(fitBounds, {
        top: 80,
        right: 40,
        bottom: Math.round(window.innerHeight * 0.5) + 40,
        left: 40,
      });
      if (map.getZoom() > 15) {
        map.setZoom(15);
      }
    }
  }, [queryParam, sortedStores, userCoords]);

  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;
      mapReadyRef.current = true;

      const clickListener = naver.maps.Event.addListener(map, "click", () => {
        setOverlapState(null);
        if (placeParamRef.current) {
          router.back();
        }
      });

      createMarkers(mapStores);

      return () => {
        naver.maps.Event.removeListener(clickListener);
        clusterCleanupRef.current?.();
        clusterCleanupRef.current = null;
        markersRef.current.forEach((m) => {
          naver.maps.Event.clearInstanceListeners(m);
          m.setMap(null);
        });
        markersRef.current = [];
        if (locationMarkerRef.current) {
          locationMarkerRef.current.setMap(null);
          locationMarkerRef.current = null;
        }
        mapRef.current = null;
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

  return (
    <>
      {geoLoading ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-muted">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <NaverMap center={initialCenter} onReady={handleReady} className="fixed inset-0" />
      )}

      {overlapState && (
        <MapOverlapPopover
          items={overlapState.items}
          anchorPos={overlapState.anchorPos}
          onSelect={handleOverlapSelect}
          onClose={handleOverlapClose}
        />
      )}

      <DubaiCookieSearchInput
        onBack={handleBack}
        onSearch={handleSearch}
        onClear={handleSearchClear}
        initialQuery={queryParam}
      />

      {showList && (
        <StoreListSheet
          stores={sortedStores}
          onSelectStore={handleSelectStore}
          onClose={isSearching ? handleCloseList : handleBack}
          onLocate={handleLocate}
        />
      )}

      {selectedStore && (
        <StoreDrawer
          key={selectedStore.placeId}
          store={selectedStore}
          onClose={handleCloseDetail}
          onLocate={handleLocate}
        />
      )}
    </>
  );
}
