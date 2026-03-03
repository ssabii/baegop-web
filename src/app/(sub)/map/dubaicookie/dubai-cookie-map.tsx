"use client";

import { useCallback, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  DUBAI_COOKIE_STORES,
  type DubaiCookieStore,
} from "@/data/dubai-cookie-stores";
import { createMarkerClustering } from "@/lib/marker-clustering";
import dynamic from "next/dynamic";
import { StoreDrawer } from "./store-drawer";

const NaverMap = dynamic(() => import("@/components/naver-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
      <Spinner className="size-8 text-primary" aria-label="로딩 중" />
    </div>
  ),
});

const MARKER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#8B4513" stroke="#8B4513" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));cursor:pointer;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`;

interface DubaiCookieMapProps {
  className?: string;
}

export function DubaiCookieMap({ className }: DubaiCookieMapProps) {
  const [selectedStore, setSelectedStore] = useState<DubaiCookieStore | null>(
    null,
  );

  const handleReady = useCallback((map: naver.maps.Map) => {
    const markers: naver.maps.Marker[] = [];

    naver.maps.Event.addListener(map, "click", () => {
      setSelectedStore(null);
    });

    DUBAI_COOKIE_STORES.forEach((store) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(store.lat, store.lng),
        title: store.name,
        icon: {
          content: MARKER_ICON,
          size: new naver.maps.Size(24, 24),
          anchor: new naver.maps.Point(12, 24),
        },
      });

      naver.maps.Event.addListener(marker, "click", () => {
        setSelectedStore(store);
      });

      markers.push(marker);
    });

    const cleanupClustering = createMarkerClustering({ map, markers });

    return () => {
      cleanupClustering();
      markers.forEach((m) => m.setMap(null));
    };
  }, []);

  return (
    <>
      <NaverMap onReady={handleReady} className={className} />
      <StoreDrawer
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </>
  );
}
