"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchPlaces } from "@/components/place-search/use-search-places";
import { useGeolocation } from "@/hooks/use-geolocation";
import { MapView, type MapMarker } from "./map-view";
import { MapSearchInput } from "./map-search-input";
import { MapResultSheet, type SnapPoint } from "./map-result-sheet";
import type { NaverSearchResult } from "@/types";

interface MapContainerProps {
  dbMarkers: MapMarker[];
}

export function MapContainer({ dbMarkers }: MapContainerProps) {
  const [query, setQuery] = useState("");
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);
  const [activeSnapPoint, setActiveSnapPoint] = useState<SnapPoint>("half");

  const userCoords = useGeolocation();
  const { results } = useSearchPlaces(query, userCoords);

  const isSearching = query.length > 0;

  const searchMarkers = useMemo<MapMarker[]>(
    () =>
      results.map((item) => ({
        id: item.id,
        lat: parseFloat(item.y),
        lng: parseFloat(item.x),
        title: item.name,
        category: item.category,
      })),
    [results],
  );

  const displayMarkers = isSearching ? searchMarkers : dbMarkers;

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setOpenInfoWindowId(null);
    setActiveSnapPoint("half");
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    setOpenInfoWindowId(null);
  }, []);

  const handleMarkerClick = useCallback(() => {
    setActiveSnapPoint("peek");
  }, []);

  const handleItemClick = useCallback((item: NaverSearchResult) => {
    setOpenInfoWindowId(item.id);
    setActiveSnapPoint("peek");
  }, []);

  return (
    <div className="relative size-full">
      <MapView
        markers={displayMarkers}
        fitBounds={false}
        openInfoWindowId={openInfoWindowId}
        onMarkerClick={handleMarkerClick}
        className="size-full"
      />
      <MapSearchInput onSearch={handleSearch} onClear={handleClear} />
      {isSearching && results.length > 0 && (
        <MapResultSheet
          results={results}
          activeSnapPoint={activeSnapPoint}
          onSnapPointChange={setActiveSnapPoint}
          onItemClick={handleItemClick}
        />
      )}
    </div>
  );
}
