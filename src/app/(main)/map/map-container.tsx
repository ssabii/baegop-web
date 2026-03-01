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
import { MapSearchOverlay } from "./map-search-overlay";
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
  const [searchMode, setSearchMode] = useState(false);
  const [focusMarkerId, setFocusMarkerId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(!!queryParam);
  const [sheetNearTop, setSheetNearTop] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NaverSearchResult | null>(
    null,
  );
  const [restoredPlace, setRestoredPlace] = useState("");

  // Sync URL → state when queryParam changes externally (render-time sync)
  if (queryParam !== prevQueryParam) {
    setPrevQueryParam(queryParam);
    setQuery(queryParam);
    if (queryParam) setSheetOpen(true);
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

  // Restore detail view from place query param (render-time sync)
  if (
    placeParam &&
    placeParam !== restoredPlace &&
    results.length > 0 &&
    !selectedItem
  ) {
    const item = results.find((r) => r.id === placeParam);
    if (item) {
      setSelectedItem(item);
      setFocusMarkerId(item.id);
      setRestoredPlace(placeParam);
    }
  }

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

  const buildUrl = useCallback(
    (q: string, placeId?: string) => {
      const params = new URLSearchParams();
      if (q) params.set("query", q);
      if (placeId) params.set("place", placeId);
      const pc = pageCountRef.current;
      if (pc > 1) params.set("pages", String(pc));
      const qs = params.toString();
      return qs ? `/map?${qs}` : "/map";
    },
    [],
  );

  const pushDetail = useCallback(
    (item: NaverSearchResult) => {
      setSelectedItem(item);
      setFocusMarkerId(item.id);
      router.replace(buildUrl(query, item.id), { scroll: false });
    },
    [router, buildUrl, query],
  );

  const dismissDetail = useCallback(() => {
    setSelectedItem(null);
    setFocusMarkerId(null);
    router.replace(buildUrl(query), { scroll: false });
  }, [router, buildUrl, query]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setSearchMode(false);
      setFocusMarkerId(null);
      setSheetOpen(true);
      setSelectedItem(null);
      pageCountRef.current = 0;
      router.replace(`/map?query=${encodeURIComponent(q)}`, { scroll: false });
    },
    [router],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setFocusMarkerId(null);
    setSheetOpen(false);
    setSelectedItem(null);
    setSheetNearTop(false);
    pageCountRef.current = 0;
    router.replace("/map", { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    if (selectedItem) {
      // detail → list
      dismissDetail();
    } else {
      // list → close
      setQuery("");
      setFocusMarkerId(null);
      setSheetOpen(false);
      setSheetNearTop(false);
      setSelectedItem(null);
      pageCountRef.current = 0;
      router.replace("/map", { scroll: false });
    }
  }, [selectedItem, dismissDetail, router]);

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
          setSelectedItem(null);
          setFocusMarkerId(null);
          setSearchMode(true);
          setSheetOpen(false);
          setSheetNearTop(false);
        }}
        onClear={handleClear}
        showBack={isSearching && sheetOpen}
        onBack={handleBack}
      />

      {showSheet && !selectedItem && (
        <MapResultSheet onNearTopChange={setSheetNearTop}>
          {hasResults ? (
            <>
              <div className="px-3">
                {results.map((item) => (
                  <PlaceItem
                    key={item.id}
                    item={item}
                    thumbnailSize="lg"
                    onClick={() => handleItemClick(item)}
                  />
                ))}
              </div>
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

      {/* Fullscreen search overlay */}
      {searchMode && (
        <MapSearchOverlay
          initialQuery={query}
          onSearch={handleSearch}
          onClose={() => setSearchMode(false)}
        />
      )}
    </div>
  );
}
