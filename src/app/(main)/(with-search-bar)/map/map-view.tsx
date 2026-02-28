"use client";

import { useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";

const NaverMap = dynamic(() => import("@/components/naver-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
      <Spinner className="size-8 text-primary" aria-label="로딩 중" />
    </div>
  ),
});

const MARKER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));cursor:pointer;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="var(--background)"/></svg>`;

interface MapViewProps {
  markers: {
    id: string;
    lat: number;
    lng: number;
    title?: string;
    category?: string | null;
  }[];
  className?: string;
}

export function MapView({ markers, className }: MapViewProps) {
  const handleReady = useCallback(
    (map: naver.maps.Map) => {
      const markerInstances: naver.maps.Marker[] = [];

      const infoWindow = new naver.maps.InfoWindow({
        content: "",
        borderWidth: 0,
        backgroundColor: "transparent",
        disableAnchor: true,
        pixelOffset: new naver.maps.Point(0, -8),
      });

      naver.maps.Event.addListener(map, "click", () => {
        infoWindow.close();
      });

      markers.forEach(({ id, lat, lng, title, category }) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(lat, lng),
          map,
          title,
          icon: {
            content: MARKER_ICON,
            size: new naver.maps.Size(16, 16),
            anchor: new naver.maps.Point(8, 16),
          },
        });

        naver.maps.Event.addListener(marker, "click", () => {
          const categoryText = category
            ? (category.split(">").pop()?.trim() ?? "")
            : "";

          const tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="var(--muted-foreground)"/></svg>`;

          const externalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`;

          infoWindow.setContent(`
            <a href="/places/${id}" style="display:block;text-decoration:none;cursor:pointer;">
              <div style="padding:10px 14px;background:var(--background);border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:nowrap;">
                <div style="display:flex;align-items:center;gap:4px;font-size:14px;font-weight:700;color:var(--foreground);"><span>${title ?? ""}</span>${externalLinkIcon}</div>
                ${categoryText ? `<div style="display:flex;align-items:center;gap:4px;margin-top:3px;">${tagIcon}<span style="font-size:12px;font-weight:500;color:var(--muted-foreground);">${categoryText}</span></div>` : ""}
              </div>
              <div style="display:flex;justify-content:center;"><svg width="12" height="6" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,0.08));"><polygon points="0,0 12,0 6,6" fill="var(--background)"/></svg></div>
            </a>
          `);
          infoWindow.open(map, marker);
        });

        markerInstances.push(marker);
      });

      return () => {
        markerInstances.forEach((m) => m.setMap(null));
        infoWindow.close();
      };
    },
    [markers],
  );

  return <NaverMap onReady={handleReady} className={className} />;
}
