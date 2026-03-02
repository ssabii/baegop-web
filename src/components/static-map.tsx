type MarkerType = "d" | "n" | "a" | "t" | "e";
type MarkerSize = "tiny" | "small" | "mid";
type MarkerColor =
  | "Default"
  | "Blue"
  | "Orange"
  | "Yellow"
  | "Red"
  | (string & {});
type MapType =
  | "basic"
  | "traffic"
  | "satellite"
  | "satellite_base"
  | "terrain";
type ImageFormat = "jpg" | "jpeg" | "png8" | "png";

type DefaultMarker = {
  type?: Exclude<MarkerType, "e">;
  size?: MarkerSize;
  color?: MarkerColor;
  /** 마커 크기 비율 (0.1~2.0, 기본 0.1) */
  viewSizeRatio?: number;
  lng: string;
  lat: string;
};

type CustomIconMarker = {
  type: "e";
  /** 커스텀 마커 아이콘 URL (PNG, SVG) */
  icon: string;
  /** 마커 앵커 위치 */
  anchor?: string;
  lng: string;
  lat: string;
};

type Marker = DefaultMarker | CustomIconMarker;

interface StaticMapProps {
  /** 중심 좌표 위도 */
  lat: string;
  /** 중심 좌표 경도 */
  lng: string;
  /** 이미지 너비 (1~1024, 기본 600) */
  w?: number;
  /** 이미지 높이 (1~1024, 기본 200) */
  h?: number;
  /** 줌 레벨 (0~20, 기본 16) */
  level?: number;
  /** 고해상도 스케일 (1 | 2, 기본 2) */
  scale?: 1 | 2;
  /** 지도 유형 */
  maptype?: MapType;
  /** 이미지 형식 */
  format?: ImageFormat;
  /** 라벨 언어 */
  lang?: "ko" | "en" | "ja" | "zh";
  /** 마커 목록 */
  markers?: Marker[];
  className?: string;
}

function buildMarkerParam(markers: Marker[]): string {
  return markers
    .map((m) => {
      if (m.type === "e") {
        const parts = [
          `type:e`,
          `icon:${m.icon}`,
          `pos:${m.lng} ${m.lat}`,
        ];
        if (m.anchor) parts.splice(2, 0, `anchor:${m.anchor}`);
        return parts.join("|");
      }
      const parts = [
        `type:${m.type ?? "d"}`,
        `size:${m.size ?? "mid"}`,
        `pos:${m.lng} ${m.lat}`,
      ];
      if (m.color) parts.splice(2, 0, `color:${m.color}`);
      if (m.viewSizeRatio != null)
        parts.splice(-1, 0, `viewSizeRatio:${m.viewSizeRatio}`);
      return parts.join("|");
    })
    .join("&markers=");
}

export function StaticMap({
  lat,
  lng,
  w = 600,
  h = 200,
  level = 16,
  scale = 2,
  maptype,
  format,
  lang,
  markers,
  className,
}: StaticMapProps) {
  const params = new URLSearchParams({
    w: String(w),
    h: String(h),
    center: `${lng},${lat}`,
    level: String(level),
    scale: String(scale),
  });
  if (maptype) params.set("maptype", maptype);
  if (format) params.set("format", format);
  if (lang) params.set("lang", lang);

  const resolvedMarkers = markers ?? [{ lng, lat }];
  const markerParam = buildMarkerParam(resolvedMarkers);
  params.set("markers", markerParam);

  return (
    <img
      src={`/api/naver-static-map?${params}`}
      alt="장소 위치 지도"
      className={className}
    />
  );
}
