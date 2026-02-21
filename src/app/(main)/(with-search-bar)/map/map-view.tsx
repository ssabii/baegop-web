"use client";

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
