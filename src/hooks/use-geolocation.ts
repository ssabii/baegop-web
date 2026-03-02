import { useState, useEffect } from "react";

interface Coords {
  lat: number;
  lng: number;
}

/** 현재 위치를 한 번 가져온다. 실패 시 undefined (호출 측에서 fallback 처리). */
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  return coords;
}
