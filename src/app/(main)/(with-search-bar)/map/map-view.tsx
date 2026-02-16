"use client";

import dynamic from "next/dynamic";

const NaverMap = dynamic(() => import("@/components/naver-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
      지도를 불러오는 중...
    </div>
  ),
});

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
  return <NaverMap markers={markers} className={className} />;
}
