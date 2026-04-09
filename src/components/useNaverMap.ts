"use client";

import { useCallback, useContext } from "react";
import { NaverMapContext } from "./NaverMapContext";
import { LOCATION_MARKER_ICON } from "@/lib/constants";

type Padding = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export interface NaverMapActions {
  morphTo: (lat: number, lng: number, zoom: number) => void;
  panTo: (lat: number, lng: number) => void;
  fitBounds: (
    points: { lat: number; lng: number }[],
    padding: Padding,
    maxZoom?: number,
  ) => void;
  getCenter: () => { lat: number; lng: number } | null;
  isInBounds: (lat: number, lng: number, bottomOffset?: number) => boolean;
  setLocationMarker: (lat: number, lng: number) => void;
  getMap: () => naver.maps.Map | null;
}

export function useNaverMap(): NaverMapActions {
  const context = useContext(NaverMapContext);

  if (!context) {
    throw new Error("useNaverMap must be used within a NaverMapProvider");
  }

  const { mapRef, locationMarkerRef } = context;

  const getMap = useCallback(
    () => mapRef.current,
    [mapRef],
  );

  const morphTo = useCallback(
    (lat: number, lng: number, zoom: number) => {
      const map = mapRef.current;
      if (!map) return;
      map.morph(new naver.maps.LatLng(lat, lng), zoom, {
        easing: "easeOutCubic",
      });
    },
    [mapRef],
  );

  const panTo = useCallback(
    (lat: number, lng: number) => {
      const map = mapRef.current;
      if (!map) return;
      map.morph(new naver.maps.LatLng(lat, lng), map.getZoom(), {
        easing: "easeOutCubic",
      });
    },
    [mapRef],
  );

  const fitBounds = useCallback(
    (
      points: { lat: number; lng: number }[],
      padding: Padding,
      maxZoom?: number,
    ) => {
      const map = mapRef.current;
      if (!map || points.length === 0) return;

      const bounds = new naver.maps.LatLngBounds(
        new naver.maps.LatLng(points[0].lat, points[0].lng),
        new naver.maps.LatLng(points[0].lat, points[0].lng),
      );
      for (const p of points) {
        bounds.extend(new naver.maps.LatLng(p.lat, p.lng));
      }

      map.fitBounds(bounds, padding);

      if (maxZoom !== undefined && map.getZoom() > maxZoom) {
        map.setZoom(maxZoom);
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
    (lat: number, lng: number, bottomOffset = 0) => {
      const map = mapRef.current;
      if (!map) return false;

      const bounds = map.getBounds() as naver.maps.LatLngBounds;
      const point = new naver.maps.LatLng(lat, lng);
      if (!bounds.hasLatLng(point)) return false;
      if (bottomOffset <= 0) return true;

      const sw = bounds.getSW();
      const ne = bounds.getNE();
      const mapHeight = map.getSize().height;
      const latPerPixel = (ne.lat() - sw.lat()) / mapHeight;
      return lat > sw.lat() + latPerPixel * bottomOffset;
    },
    [mapRef],
  );

  const setLocationMarker = useCallback(
    (lat: number, lng: number) => {
      const map = mapRef.current;
      if (!map) return;

      const latlng = new naver.maps.LatLng(lat, lng);

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
    morphTo,
    panTo,
    fitBounds,
    getCenter,
    isInBounds,
    setLocationMarker,
    getMap,
  };
}
