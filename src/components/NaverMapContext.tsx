"use client";

import { createContext, useRef, useMemo, type ReactNode } from "react";

export interface NaverMapContextValue {
  mapRef: React.MutableRefObject<naver.maps.Map | null>;
  locationMarkerRef: React.MutableRefObject<naver.maps.Marker | null>;
}

export const NaverMapContext = createContext<NaverMapContextValue | null>(null);

export function NaverMapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const locationMarkerRef = useRef<naver.maps.Marker | null>(null);

  const value = useMemo<NaverMapContextValue>(
    () => ({ mapRef, locationMarkerRef }),
    [],
  );

  return (
    <NaverMapContext.Provider value={value}>
      {children}
    </NaverMapContext.Provider>
  );
}
