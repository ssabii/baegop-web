"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  DUBAI_COOKIE_STORES,
  type DubaiCookieStore,
} from "@/data/dubai-cookie-stores";
import { createMarkerClustering } from "@/lib/marker-clustering";
import { useGeolocation } from "@/hooks/use-geolocation";
import dynamic from "next/dynamic";
import { LocationButton } from "./location-button";
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

const CLUSTER_MAX_ZOOM = 15;

function createMarkerContent(name: string): string {
  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
  <img src="/dubai-cookie.svg" width="32" height="32" alt="" />
  <span style="font-size:12px;font-weight:600;color:var(--foreground);background:var(--background);padding:1px 4px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.15);max-width:120px;overflow:hidden;text-overflow:ellipsis;">${name}</span>
</div>`;
}

export function DubaiCookieMap() {
  const [selectedStore, setSelectedStore] = useState<DubaiCookieStore | null>(
    null,
  );
  const [showList, setShowList] = useState(true);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const locationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const userCoords = useGeolocation();
  const initialCenteredRef = useRef(false);

  // 현재 위치를 받으면 최초 1회 맵 센터 이동
  useEffect(() => {
    if (!userCoords || !mapRef.current || initialCenteredRef.current) return;
    initialCenteredRef.current = true;
    mapRef.current.setCenter(
      new naver.maps.LatLng(userCoords.lat, userCoords.lng),
    );
  }, [userCoords]);

  const handleReady = useCallback((map: naver.maps.Map) => {
    mapRef.current = map;
    const markers: naver.maps.Marker[] = [];

    naver.maps.Event.addListener(map, "click", () => {
      setSelectedStore(null);
    });

    DUBAI_COOKIE_STORES.forEach((store) => {
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
        setSelectedStore(store);
        map.panTo(new naver.maps.LatLng(store.lat, store.lng));
      });

      markers.push(marker);
    });

    const cleanupClustering = createMarkerClustering({
      map,
      markers,
      maxZoom: CLUSTER_MAX_ZOOM,
      clusterColors: { light: "#B0CC50", dark: "#8EB035" },
      onClusterClick: (cluster) => {
        const currentZoom = map.getZoom();
        const targetZoom = Math.min(currentZoom + 3, CLUSTER_MAX_ZOOM + 1);
        map.setCenter(cluster.getCenter());
        map.setZoom(targetZoom);
      },
    });

    return () => {
      cleanupClustering();
      markers.forEach((m) => m.setMap(null));
    };
  }, []);

  const handleSelectStore = useCallback((store: DubaiCookieStore) => {
    setSelectedStore(store);
    mapRef.current?.panTo(new naver.maps.LatLng(store.lat, store.lng));
  }, []);

  const handleLocate = useCallback(
    (position: { lat: number; lng: number }) => {
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
    },
    [],
  );

  const handleCloseList = useCallback(() => {
    setShowList(false);
    setSelectedStore(null);
  }, []);

  return (
    <div className="relative flex-1">
      <NaverMap onReady={handleReady} className="size-full" />

      <div className="absolute right-4 bottom-4 z-10">
        <LocationButton onLocate={handleLocate} />
      </div>

      {showList && !selectedStore && (
        <StoreListSheet
          stores={DUBAI_COOKIE_STORES}
          selectedStore={selectedStore}
          onSelectStore={handleSelectStore}
          onClose={handleCloseList}
        />
      )}

      <StoreDrawer
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </div>
  );
}
