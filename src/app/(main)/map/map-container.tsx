"use client";

import { useCallback, useState } from "react";
import { useSearchPlaces } from "@/components/place-search/use-search-places";
import { MapView, type MapMarker } from "./map-view";
import { MapSearchInput } from "./map-search-input";
import { MapResultCards } from "./map-result-cards";
import type { NaverSearchResult } from "@/types";

interface MapContainerProps {
  dbMarkers: MapMarker[];
}

export function MapContainer({ dbMarkers }: MapContainerProps) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);

  const { results } = useSearchPlaces(query);

  const isSearching = query.length > 0;

  const searchMarkers: MapMarker[] = results.map((item) => ({
    id: item.id,
    lat: parseFloat(item.y),
    lng: parseFloat(item.x),
    title: item.name,
    category: item.category,
  }));

  const displayMarkers = isSearching ? searchMarkers : dbMarkers;

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setActiveId(null);
    setScrollToId(null);
    setOpenInfoWindowId(null);
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    setActiveId(null);
    setScrollToId(null);
    setOpenInfoWindowId(null);
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    setActiveId(id);
    setScrollToId(id);
  }, []);

  const handleCardClick = useCallback((item: NaverSearchResult) => {
    setActiveId(item.id);
    setOpenInfoWindowId(item.id);
  }, []);

  return (
    <div className="relative size-full">
      <MapView
        markers={displayMarkers}
        fitBounds={isSearching}
        openInfoWindowId={openInfoWindowId}
        onMarkerClick={handleMarkerClick}
        className="size-full"
      />
      <MapSearchInput onSearch={handleSearch} onClear={handleClear} />
      {isSearching && results.length > 0 && (
        <MapResultCards
          results={results}
          activeId={activeId}
          onCardClick={handleCardClick}
          scrollToId={scrollToId}
        />
      )}
    </div>
  );
}
