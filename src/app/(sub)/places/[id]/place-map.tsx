"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { NaverMapProvider } from "@/components/NaverMapContext";
import { Spinner } from "@/components/ui/spinner";
import { useNaverMap } from "@/components/useNaverMap";

const NaverMap = dynamic(() => import("@/components/NaverMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted flex h-[30vh] items-center justify-center overflow-hidden rounded-xl border">
      <Spinner className="text-primary size-8" aria-label="로딩 중" />
    </div>
  ),
});

const MARKER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="var(--background)"/></svg>`;

interface PlaceMapProps {
  lat: string;
  lng: string;
  name?: string;
  address?: string;
}

export function PlaceMap(props: PlaceMapProps) {
  return (
    <NaverMapProvider>
      <PlaceMapInner {...props} />
    </NaverMapProvider>
  );
}

function PlaceMapInner({ lat, lng, name }: PlaceMapProps) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  const { getMap } = useNaverMap();
  const markerRef = useRef<naver.maps.Marker | null>(null);

  const handleReady = useCallback(() => {
    const map = getMap();
    if (!map) return;

    markerRef.current = new naver.maps.Marker({
      position: new naver.maps.LatLng(numLat, numLng),
      map,
      title: name,
      icon: {
        content: MARKER_ICON,
        size: new naver.maps.Size(16, 16),
        anchor: new naver.maps.Point(8, 16),
      },
    });
  }, [getMap, numLat, numLng, name]);

  useEffect(() => {
    return () => {
      markerRef.current?.setMap(null);
      markerRef.current = null;
    };
  }, []);

  return (
    <section>
      <NaverMap
        center={{ lat: numLat, lng: numLng }}
        zoom={17}
        onReady={handleReady}
        className="isolate h-[30vh] overflow-hidden rounded-xl border"
      />
    </section>
  );
}
