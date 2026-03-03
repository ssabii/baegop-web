"use client";

import { useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";

const NaverMap = dynamic(() => import("@/components/naver-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[30vh] items-center justify-center overflow-hidden rounded-xl border bg-muted">
      <Spinner className="size-8 text-primary" aria-label="로딩 중" />
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

export function PlaceMap({ lat, lng, name, address }: PlaceMapProps) {
  const numLat = Number(lat);
  const numLng = Number(lng);

  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(numLat, numLng),
        map,
        title: name,
        icon: {
          content: MARKER_ICON,
          size: new naver.maps.Size(16, 16),
          anchor: new naver.maps.Point(8, 16),
        },
      });

      return () => {
        marker.setMap(null);
      };
    },
    [numLat, numLng, name],
  );

  return (
    <section>
      <NaverMap
        center={{ lat: numLat, lng: numLng }}
        zoom={17}
        onReady={handleReady}
        className="isolate h-[30vh] rounded-xl overflow-hidden border"
      />
    </section>
  );
}
