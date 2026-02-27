"use client";

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

interface PlaceMapProps {
  lat: string;
  lng: string;
  name?: string;
}

export function PlaceMap({ lat, lng, name }: PlaceMapProps) {
  return (
    <section>
      <NaverMap
        center={{ lat: Number(lat), lng: Number(lng) }}
        zoom={17}
        markers={[
          {
            id: "place",
            lat: Number(lat),
            lng: Number(lng),
            title: name,
          },
        ]}
        className="h-[30vh] rounded-xl overflow-hidden"
      />
    </section>
  );
}
