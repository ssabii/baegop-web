import { useState, useEffect } from "react";

interface Coords {
  lat: number;
  lng: number;
}

interface GeolocationResult {
  coords: Coords | undefined;
  loading: boolean;
}

/** 현재 위치를 한 번 가져온다. 실패 시 coords는 undefined (호출 측에서 fallback 처리). */
export function useGeolocation(): GeolocationResult {
  const [coords, setCoords] = useState<Coords>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  return { coords, loading };
}
