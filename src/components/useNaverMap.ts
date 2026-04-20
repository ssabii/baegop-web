"use client";

import { useCallback, useContext } from "react";
import { LOCATION_MARKER_ICON } from "@/lib/constants";
import { NaverMapContext } from "./NaverMapContext";

type LatLngLiteral = { lat: number; lng: number };

export interface NaverMapActions {
  morph: (
    coord: LatLngLiteral,
    zoom?: number,
    transitionOptions?: naver.maps.TransitionOptions,
  ) => void;
  panTo: (
    coord: LatLngLiteral,
    transitionOptions?: naver.maps.TransitionOptions,
  ) => void;
  fitBounds: (
    bounds: LatLngLiteral[] | naver.maps.LatLngBounds,
    options?: naver.maps.FitBoundsOptions,
  ) => void;
  getCenter: () => LatLngLiteral | null;
  isInBounds: (coord: LatLngLiteral, bottomOffset?: number) => boolean;
  setLocationMarker: (coord: LatLngLiteral) => void;
  getMap: () => naver.maps.Map | null;
}

export function useNaverMap(): NaverMapActions {
  const context = useContext(NaverMapContext);

  if (!context) {
    throw new Error("useNaverMap must be used within a NaverMapProvider");
  }

  const { mapRef, locationMarkerRef } = context;

  const getMap = useCallback(() => mapRef.current, [mapRef]);

  const morph = useCallback(
    (
      coord: LatLngLiteral,
      zoom?: number,
      transitionOptions?: naver.maps.TransitionOptions,
    ) => {
      const map = mapRef.current;
      if (!map) return;
      map.morph(
        new naver.maps.LatLng(coord.lat, coord.lng),
        zoom,
        transitionOptions,
      );
    },
    [mapRef],
  );

  const panTo = useCallback(
    (
      coord: LatLngLiteral,
      transitionOptions?: naver.maps.TransitionOptions,
    ) => {
      const map = mapRef.current;
      if (!map) return;
      map.panTo(new naver.maps.LatLng(coord.lat, coord.lng), transitionOptions);
    },
    [mapRef],
  );

  const fitBounds = useCallback(
    (
      bounds: LatLngLiteral[] | naver.maps.LatLngBounds,
      options?: naver.maps.FitBoundsOptions,
    ) => {
      const map = mapRef.current;
      if (!map) return;

      if (Array.isArray(bounds)) {
        if (bounds.length === 0) return;
        const latLngBounds = new naver.maps.LatLngBounds(
          new naver.maps.LatLng(bounds[0].lat, bounds[0].lng),
          new naver.maps.LatLng(bounds[0].lat, bounds[0].lng),
        );
        for (const p of bounds) {
          latLngBounds.extend(new naver.maps.LatLng(p.lat, p.lng));
        }
        map.fitBounds(latLngBounds, options);
      } else {
        map.fitBounds(bounds, options);
      }
    },
    [mapRef],
  );

  const getCenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return null;
    const center = map.getCenter() as naver.maps.LatLng;
    return { lat: center.lat(), lng: center.lng() };
  }, [mapRef]);

  const isInBounds = useCallback(
    (coord: LatLngLiteral, bottomOffset = 0) => {
      const map = mapRef.current;
      if (!map) return false;

      const bounds = map.getBounds() as naver.maps.LatLngBounds;
      const point = new naver.maps.LatLng(coord.lat, coord.lng);
      if (!bounds.hasLatLng(point)) return false;
      if (bottomOffset <= 0) return true;

      const sw = bounds.getSW();
      const ne = bounds.getNE();
      const mapHeight = map.getSize().height;
      const latPerPixel = (ne.lat() - sw.lat()) / mapHeight;
      return coord.lat > sw.lat() + latPerPixel * bottomOffset;
    },
    [mapRef],
  );

  const setLocationMarker = useCallback(
    (coord: LatLngLiteral) => {
      const map = mapRef.current;
      if (!map) return;

      const latlng = new naver.maps.LatLng(coord.lat, coord.lng);

      if (locationMarkerRef.current) {
        locationMarkerRef.current.setPosition(latlng);
      } else {
        locationMarkerRef.current = new naver.maps.Marker({
          position: latlng,
          map,
          icon: {
            content: LOCATION_MARKER_ICON.content,
            size: new naver.maps.Size(
              LOCATION_MARKER_ICON.size.width,
              LOCATION_MARKER_ICON.size.height,
            ),
            anchor: new naver.maps.Point(
              LOCATION_MARKER_ICON.anchor.x,
              LOCATION_MARKER_ICON.anchor.y,
            ),
          },
          zIndex: 100,
        });
      }
    },
    [mapRef, locationMarkerRef],
  );

  return {
    morph,
    panTo,
    fitBounds,
    getCenter,
    isInBounds,
    setLocationMarker,
    getMap,
  };
}
