"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { LocationButton } from "@/components/location-button";
import { MapOverlapPopover } from "@/components/map-overlap-popover";
import { NaverMapProvider } from "@/components/NaverMapContext";
import { PlaceItem } from "@/components/place-search/place-item";
import { SearchNoResults } from "@/components/place-search/search-no-results";
import { useSearchPlaces } from "@/components/place-search/use-search-places";
import { Spinner } from "@/components/ui/spinner";
import { useNaverMap } from "@/components/useNaverMap";
import { useGeolocation } from "@/hooks/use-geolocation";
import { COMPANY_LOCATION } from "@/lib/constants";
import { calculateDistance } from "@/lib/geo";
import { MapPlaceDetailSheet } from "./map-place-detail-sheet";
import { MapResultSheet } from "./map-result-sheet";
import { MapSearchInput } from "./map-search-input";
import { MapView, type MapMarker } from "./map-view";
import { useMapPlaces } from "./use-map-places";
import type { NaverSearchResult } from "@/types";

const NEARBY_COUNT = 5;
const NEARBY_MAX_DISTANCE_M = 5000;

export function MapContainer() {
  return (
    <NaverMapProvider>
      <MapContainerInner />
    </NaverMapProvider>
  );
}

function MapContainerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") ?? "";
  const placeParam = searchParams.get("place") ?? "";

  const [query, setQuery] = useState(queryParam);
  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);

  const [mapMoved, setMapMoved] = useState(false);
  const [searchCoords, setSearchCoords] = useState<
    { lat: number; lng: number } | undefined
  >();
  // Stores detail item from DB place click (not from search results)
  const [dbDetailItem, setDbDetailItem] = useState<NaverSearchResult | null>(
    null,
  );
  const [overlapState, setOverlapState] = useState<{
    items: MapMarker[];
    anchorPos: { x: number; y: number };
  } | null>(null);

  // Sync URL → state when queryParam changes externally (render-time sync)
  if (queryParam !== prevQueryParam) {
    setPrevQueryParam(queryParam);
    setQuery(queryParam);
    setMapMoved(false);
    setSearchCoords(undefined);
  }

  const { morph, fitBounds, getCenter, isInBounds, setLocationMarker } =
    useNaverMap();

  const handleLocate = useCallback(
    (position: { lat: number; lng: number }) => {
      morph(position, 16);
      setLocationMarker(position);
    },
    [morph, setLocationMarker],
  );

  const handleDragEnd = useCallback(() => {
    setOverlapState(null);
    setMapMoved(true);
  }, []);

  const handleSearchInMap = useCallback(() => {
    const center = getCenter();
    if (!center) return;
    setSearchCoords(center);
    setMapMoved(false);
  }, [getCenter]);

  const { coords: userCoords, loading: geoLoading } = useGeolocation();
  const initialCenter = userCoords ?? COMPANY_LOCATION;

  const effectiveCoords = searchCoords ?? userCoords;
  // Delay search until geolocation resolves to prevent double fitBounds
  const searchQuery = geoLoading ? "" : query;
  const {
    results,
    pageCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSearchPlaces(searchQuery, effectiveCoords);
  // Derive UI state from URL params (single source of truth)
  const selectedItem = useMemo(() => {
    if (!placeParam) return null;
    // Search results first, then DB place detail
    return (
      results.find((r) => r.id === placeParam) ??
      (dbDetailItem?.id === placeParam ? dbDetailItem : null)
    );
  }, [placeParam, results, dbDetailItem]);

  const focusMarkerId = selectedItem?.id ?? null;
  const sheetOpen = !!query;

  // Refs for URL sync without stale closures
  const pageCountRef = useRef(0);
  useEffect(() => {
    pageCountRef.current = pageCount;
  }, [pageCount]);

  // Infinite scroll sentinel
  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  // Sync pages count to URL
  useEffect(() => {
    if (!query || pageCount <= 1) return;
    const currentPages = searchParams.get("pages");
    if (currentPages === String(pageCount)) return;
    const params = new URLSearchParams(searchParams);
    params.set("pages", String(pageCount));
    router.replace(`/map?${params}`, { scroll: false });
  }, [pageCount, query, searchParams, router]);

  // DB places for initial state
  const { data: mapPlaces = [] } = useMapPlaces();

  const defaultMarkers = useMemo<MapMarker[]>(
    () =>
      mapPlaces.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        title: p.name,
        category: p.category,
      })),
    [mapPlaces],
  );

  // Detail view: show only focused marker. List view: show all.
  const activeMarkers = useMemo<MapMarker[]>(() => {
    const items = selectedItem
      ? results.filter((r) => r.id === selectedItem.id)
      : results;

    return items.map((item) => ({
      id: item.id,
      lat: parseFloat(item.y),
      lng: parseFloat(item.x),
      title: item.name,
      category: item.category,
    }));
  }, [results, selectedItem]);

  const buildUrl = useCallback((q: string, placeId?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("query", q);
    if (placeId) params.set("place", placeId);
    const pc = pageCountRef.current;
    if (pc > 1) params.set("pages", String(pc));
    const qs = params.toString();
    return qs ? `/map?${qs}` : "/map";
  }, []);

  const pushDetail = useCallback(
    (item: NaverSearchResult) => {
      setMapMoved(false);
      const url = buildUrl(query, item.id);
      if (placeParam) {
        // detail → detail (marker click): replace to avoid history bloat
        router.replace(url, { scroll: false });
      } else {
        // list → detail: push to preserve list URL in history
        router.push(url, { scroll: false });
      }
    },
    [router, buildUrl, query, placeParam],
  );

  const dismissDetail = useCallback(() => {
    router.back();
  }, [router]);

  const handleClear = useCallback(() => {
    setOverlapState(null);
    setQuery("");
    setMapMoved(false);
    setSearchCoords(undefined);
    setDbDetailItem(null);
    router.replace("/map", { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      // Search results first
      const searchItem = results.find((r) => r.id === id);
      if (searchItem) {
        pushDetail(searchItem);
        return;
      }

      // DB places fallback
      const dbPlace = mapPlaces.find((p) => p.id === id);
      if (dbPlace) {
        const item: NaverSearchResult = {
          id: dbPlace.id,
          name: dbPlace.name,
          category: dbPlace.category ?? "",
          address: dbPlace.address,
          roadAddress: dbPlace.address,
          phone: null,
          x: String(dbPlace.lng),
          y: String(dbPlace.lat),
          imageUrl: dbPlace.image_urls?.[0] ?? null,
          menus: [],
        };
        setDbDetailItem(item);
        pushDetail(item);
      }
    },
    [results, mapPlaces, pushDetail],
  );

  const handleOverlapClick = useCallback(
    (items: MapMarker[], anchorPos: { x: number; y: number }) => {
      setOverlapState({ items, anchorPos });
    },
    [],
  );

  const handleOverlapSelect = useCallback(
    (id: string) => {
      setOverlapState(null);
      handleMarkerClick(id);
    },
    [handleMarkerClick],
  );

  const handleOverlapClose = useCallback(() => {
    setOverlapState(null);
  }, []);

  const handleItemClick = useCallback(
    (item: NaverSearchResult) => {
      pushDetail(item);
    },
    [pushDetail],
  );

  const isSearching = query.length > 0;
  const hasResults = results.length > 0;
  const showSheet = isSearching && sheetOpen && !isLoading && !geoLoading;

  // fitBounds to nearby search results (Naver Maps style)
  const lastBoundsCheckKeyRef = useRef("");
  useEffect(() => {
    if (!showSheet || !hasResults) return;
    const key = `${query}|${searchCoords?.lat}|${searchCoords?.lng}`;
    if (lastBoundsCheckKeyRef.current === key) return;
    lastBoundsCheckKeyRef.current = key;

    // Use first search result as the origin (API returns relevance-sorted)
    const first = results[0];
    const origin = { lat: parseFloat(first.y), lng: parseFloat(first.x) };

    const nearby = results
      .map((r) => ({
        lat: parseFloat(r.y),
        lng: parseFloat(r.x),
      }))
      .filter((r) => calculateDistance(origin, r) <= NEARBY_MAX_DISTANCE_M)
      .slice(0, NEARBY_COUNT);

    const sheetOffset = Math.round(window.innerHeight * 0.5);
    const allVisible = nearby.every((r) => isInBounds(r, sheetOffset));

    if (!allVisible) {
      fitBounds(nearby, {
        top: 80,
        bottom: Math.round(window.innerHeight * 0.5),
        left: 40,
        right: 40,
        maxZoom: 15,
      });
    }
  }, [
    showSheet,
    hasResults,
    query,
    results,
    searchCoords,
    isInBounds,
    fitBounds,
  ]);

  const displayMarkers = isSearching
    ? showSheet && hasResults
      ? activeMarkers
      : []
    : defaultMarkers;

  return (
    <>
      {geoLoading ? (
        <div className="bg-muted fixed inset-x-0 top-0 bottom-15 z-20 flex items-center justify-center">
          <Spinner className="text-primary size-8" />
        </div>
      ) : (
        <MapView
          center={initialCenter}
          markers={displayMarkers}
          focusMarkerId={focusMarkerId}
          onMarkerClick={handleMarkerClick}
          onOverlapClick={handleOverlapClick}
          onMapClick={handleOverlapClose}
          onDragEnd={handleDragEnd}
          showLabels={isSearching}
          className="fixed inset-x-0 top-0 bottom-15"
        />
      )}

      {overlapState && (
        <MapOverlapPopover
          items={overlapState.items}
          anchorPos={overlapState.anchorPos}
          onSelect={handleOverlapSelect}
          onClose={handleOverlapClose}
        />
      )}

      <MapSearchInput
        query={query}
        onTap={() => {
          const searchUrl = query
            ? `/search?query=${encodeURIComponent(query)}`
            : "/search";
          router.push(searchUrl);
        }}
        onClear={handleClear}
        showBack={isSearching && sheetOpen}
        onBack={handleBack}
      />

      {showSheet && !selectedItem && (
        <MapResultSheet
          onClose={handleClear}
          onLocate={handleLocate}
          showSearchInMap={mapMoved && !!query}
          onSearchInMap={handleSearchInMap}
        >
          {hasResults ? (
            <>
              <ul className="divide-y px-3">
                {results.map((item) => (
                  <li key={item.id}>
                    <PlaceItem
                      item={item}
                      thumbnailSize="lg"
                      onClick={() => handleItemClick(item)}
                    />
                  </li>
                ))}
              </ul>
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <Spinner className="text-primary size-6" />
                )}
              </div>
            </>
          ) : (
            <SearchNoResults />
          )}
        </MapResultSheet>
      )}

      {!showSheet && !selectedItem && (
        <div className="fixed inset-x-0 bottom-19 z-10 mx-auto w-full max-w-4xl px-2">
          <div className="flex justify-end">
            <LocationButton onLocate={handleLocate} />
          </div>
        </div>
      )}

      {selectedItem && (
        <MapPlaceDetailSheet
          item={selectedItem}
          onDismiss={dismissDetail}
          onLocate={handleLocate}
        />
      )}
    </>
  );
}
