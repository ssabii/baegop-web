"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { useSearchPlaces } from "@/components/place-search/use-search-places";
import { SearchNoResults } from "@/components/place-search/search-no-results";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Spinner } from "@/components/ui/spinner";
import { MapView, type MapMarker } from "./map-view";
import { MapSearchInput } from "./map-search-input";
import { PlaceItem } from "@/components/place-search/place-item";
import { MapResultSheet } from "./map-result-sheet";
import { MapPlaceDetailSheet } from "./map-place-detail-sheet";
import type { NaverSearchResult } from "@/types";

export function MapContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") ?? "";
  const placeParam = searchParams.get("place") ?? "";

  const [query, setQuery] = useState(queryParam);
  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
  const [sheetNearTop, setSheetNearTop] = useState(false);

  // Sync URL → state when queryParam changes externally (render-time sync)
  if (queryParam !== prevQueryParam) {
    setPrevQueryParam(queryParam);
    setQuery(queryParam);
    if (!queryParam) setSheetNearTop(false);
  }

  const userCoords = useGeolocation();
  const {
    results,
    pageCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSearchPlaces(query, userCoords);

  // Derive UI state from URL params (single source of truth)
  const selectedItem = useMemo(() => {
    if (!placeParam || results.length === 0) return null;
    return results.find((r) => r.id === placeParam) ?? null;
  }, [placeParam, results]);

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
    setQuery("");
    setSheetNearTop(false);
    router.replace("/map", { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      const item = results.find((r) => r.id === id);
      if (item) pushDetail(item);
    },
    [results, pushDetail],
  );

  const handleItemClick = useCallback(
    (item: NaverSearchResult) => {
      pushDetail(item);
    },
    [pushDetail],
  );

  const isSearching = query.length > 0;
  const hasResults = results.length > 0;
  const showSheet = isSearching && sheetOpen && !isLoading;

  return (
    <div className="relative size-full">
      <MapView
        markers={showSheet && hasResults ? activeMarkers : []}
        fitBounds={showSheet && hasResults && !selectedItem}
        focusMarkerId={focusMarkerId}
        onMarkerClick={handleMarkerClick}
        className="size-full"
      />

      {sheetNearTop && (
        <div className="absolute inset-x-0 top-0 z-40 h-[68px] bg-background" />
      )}

      <MapSearchInput
        query={query}
        onTap={() => {
          const searchUrl = query
            ? `/map/search?query=${encodeURIComponent(query)}`
            : "/map/search";
          router.push(searchUrl);
        }}
        onClear={handleClear}
        showBack={isSearching && sheetOpen}
        onBack={handleBack}
      />

      {showSheet && !selectedItem && (
        <MapResultSheet onNearTopChange={setSheetNearTop}>
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
                  <Spinner className="size-6 text-primary" />
                )}
              </div>
            </>
          ) : (
            <SearchNoResults />
          )}
        </MapResultSheet>
      )}

      {selectedItem && (
        <MapPlaceDetailSheet item={selectedItem} onDismiss={dismissDetail} />
      )}
    </div>
  );
}
