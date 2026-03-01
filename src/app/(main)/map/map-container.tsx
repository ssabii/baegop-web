"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchPlaces } from "@/components/place-search/use-search-places";
import { useGeolocation } from "@/hooks/use-geolocation";
import { COMPANY_LOCATION } from "@/lib/constants";
import { MapView, type MapMarker } from "./map-view";
import { MapSearchInput } from "./map-search-input";
import { MapSearchOverlay } from "./map-search-overlay";
import { PlaceItem } from "@/components/place-search/place-item";
import { MapResultSheet } from "./map-result-sheet";
import { MapPlaceDetail } from "./map-place-detail";
import type { NaverSearchResult } from "@/types";

type SheetView =
  | { type: "list" }
  | { type: "detail"; item: NaverSearchResult };

export function MapContainer() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [focusMarkerId, setFocusMarkerId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetNearTop, setSheetNearTop] = useState(false);
  const [viewStack, setViewStack] = useState<SheetView[]>([{ type: "list" }]);

  const userCoords = useGeolocation();
  const { results } = useSearchPlaces(query, userCoords);

  const currentView = viewStack[viewStack.length - 1];

  // Sort results by distance from reference point (user location or company)
  const sortedResults = useMemo(() => {
    const ref = userCoords ?? COMPANY_LOCATION;
    return [...results].sort((a, b) => {
      const da =
        (parseFloat(a.y) - ref.lat) ** 2 + (parseFloat(a.x) - ref.lng) ** 2;
      const db =
        (parseFloat(b.y) - ref.lat) ** 2 + (parseFloat(b.x) - ref.lng) ** 2;
      return da - db;
    });
  }, [results, userCoords]);

  const searchMarkers = useMemo<MapMarker[]>(
    () =>
      sortedResults.map((item) => ({
        id: item.id,
        lat: parseFloat(item.y),
        lng: parseFloat(item.x),
        title: item.name,
        category: item.category,
      })),
    [sortedResults],
  );

  const pushDetail = useCallback((item: NaverSearchResult) => {
    setViewStack((prev) => [...prev, { type: "detail", item }]);
    setFocusMarkerId(item.id);
  }, []);

  const popView = useCallback(() => {
    setViewStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setFocusMarkerId(null);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setSearchMode(false);
    setFocusMarkerId(null);
    setSheetOpen(true);
    setViewStack([{ type: "list" }]);
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    setFocusMarkerId(null);
    setSheetOpen(false);
    setViewStack([{ type: "list" }]);
    setSheetNearTop(false);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setSheetNearTop(false);
    setViewStack([{ type: "list" }]);
  }, []);

  const handleMarkerClick = useCallback(
    (id: string) => {
      const item = sortedResults.find((r) => r.id === id);
      if (item) pushDetail(item);
    },
    [sortedResults, pushDetail],
  );

  const handleItemClick = useCallback(
    (item: NaverSearchResult) => {
      pushDetail(item);
    },
    [pushDetail],
  );

  const isSearching = query.length > 0;
  const showSheet = isSearching && sortedResults.length > 0 && sheetOpen;

  return (
    <div className="relative size-full">
      <MapView
        markers={showSheet ? searchMarkers : []}
        fitBounds={showSheet && currentView.type === "list"}
        focusMarkerId={focusMarkerId}
        onMarkerClick={handleMarkerClick}
        className="size-full"
      />

      {sheetNearTop && (
        <div className="absolute inset-x-0 top-0 z-40 h-[68px] bg-background" />
      )}

      <MapSearchInput
        query={query}
        onTap={() => setSearchMode(true)}
        onClear={handleClear}
        showBack={currentView.type === "detail"}
        onBack={popView}
      />

      {showSheet && (
        <MapResultSheet
          onClose={handleSheetClose}
          onNearTopChange={setSheetNearTop}
          compact={currentView.type === "detail"}
        >
          {/* List view — use hidden to preserve scroll position */}
          <div className={currentView.type === "list" ? undefined : "hidden"}>
            <div className="px-3">
              {sortedResults.map((item) => (
                <PlaceItem
                  key={item.id}
                  item={item}
                  thumbnailSize="lg"
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          </div>

          {/* Detail view */}
          {currentView.type === "detail" && (
            <MapPlaceDetail item={currentView.item} />
          )}
        </MapResultSheet>
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
