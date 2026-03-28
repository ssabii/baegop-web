import { useState, useEffect } from "react";

interface Coords {
  lat: number;
  lng: number;
}

interface GeolocationResult {
  coords: Coords | undefined;
  loading: boolean;
}

const createGeolocationCache = () => {
  let cachedCoords: Coords | undefined;
  let resolved = false;
  const listeners = new Set<() => void>();

  const resolve = (coords?: Coords) => {
    cachedCoords = coords;
    resolved = true;
    listeners.forEach((fn) => fn());
    listeners.clear();
  };

  return {
    getCoords: () => cachedCoords,
    isResolved: () => resolved,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    init: () => {
      if (resolved) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(),
      );
    },
  };
};

const geoCache = createGeolocationCache();

/** 현재 위치를 한 번 가져온다. 실패 시 coords는 undefined (호출 측에서 fallback 처리). */
export function useGeolocation(): GeolocationResult {
  const [coords, setCoords] = useState<Coords | undefined>(geoCache.getCoords);
  const [loading, setLoading] = useState(!geoCache.isResolved());

  useEffect(() => {
    if (geoCache.isResolved()) {
      setCoords(geoCache.getCoords());
      setLoading(false);
      return;
    }

    const unsubscribe = geoCache.subscribe(() => {
      setCoords(geoCache.getCoords());
      setLoading(false);
    });

    geoCache.init();

    return unsubscribe;
  }, []);

  return { coords, loading };
}
