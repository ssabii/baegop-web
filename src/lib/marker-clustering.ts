declare global {
  interface Window {
    MarkerClustering: new (options: {
      map: naver.maps.Map;
      markers: naver.maps.Marker[];
      gridSize: number;
      maxZoom: number;
      minClusterSize: number;
      icons: Array<{ content: string; size: naver.maps.Size; anchor: naver.maps.Point }>;
      indexGenerator: number[];
      stylingFunction: (clusterMarker: naver.maps.Marker, count: number) => void;
    }) => {
      setMap: (map: naver.maps.Map | null) => void;
    };
  }
}

interface MarkerClusteringOptions {
  map: naver.maps.Map;
  markers: naver.maps.Marker[];
  gridSize?: number;
  maxZoom?: number;
  minClusterSize?: number;
  clusterColors?: { light: string; dark: string };
  onClusterClick?: (cluster: {
    getCenter: () => naver.maps.LatLng;
    getBounds: () => naver.maps.LatLngBounds;
  }) => void;
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

function createClusterIcon(size: number, colors?: { light: string; dark: string }): {
  content: string;
  size: naver.maps.Size;
  anchor: naver.maps.Point;
} {
  const half = size / 2;
  const bg = colors
    ? (isDarkMode() ? colors.dark : colors.light)
    : "oklch(var(--primary))";
  const fg = colors ? "#fff" : "oklch(var(--primary-foreground))";
  return {
    content: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-size:${size < 44 ? 12 : 14}px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;"></div>`,
    size: new naver.maps.Size(size, size),
    anchor: new naver.maps.Point(half, half),
  };
}

/**
 * 네이버 맵 마커 클러스터링을 생성한다.
 * 클러스터 아이콘은 개수에 따라 크기가 달라진다.
 * @returns cleanup 함수 (setMap(null) 호출)
 */
export function createMarkerClustering({
  map,
  markers,
  gridSize = 120,
  maxZoom = 15,
  minClusterSize = 2,
  clusterColors,
  onClusterClick,
}: MarkerClusteringOptions): () => void {
  const clustering = new window.MarkerClustering({
    map,
    markers,
    gridSize,
    maxZoom,
    minClusterSize,
    icons: [
      createClusterIcon(36, clusterColors),
      createClusterIcon(44, clusterColors),
      createClusterIcon(54, clusterColors),
    ],
    indexGenerator: [10, 50, Infinity],
    stylingFunction: (clusterMarker, count) => {
      const el = clusterMarker.getElement();
      const div = el?.querySelector("div") as HTMLDivElement | null;
      if (div) {
        div.textContent = String(count);

        if (onClusterClick) {
          div.onclick = (e) => {
            e.stopPropagation();
            const pos = clusterMarker.getPosition() as naver.maps.LatLng;

            // Compute bounds from markers within the cluster's grid cell
            const proj = map.getProjection();
            const centerPt = proj.fromCoordToOffset(pos);
            const half = gridSize / 2;
            const bounds = new naver.maps.LatLngBounds(pos, pos);

            for (const m of markers) {
              const mPos = m.getPosition() as naver.maps.LatLng;
              const mPt = proj.fromCoordToOffset(mPos);
              if (
                Math.abs(mPt.x - centerPt.x) <= half &&
                Math.abs(mPt.y - centerPt.y) <= half
              ) {
                bounds.extend(mPos);
              }
            }

            onClusterClick({
              getCenter: () => pos,
              getBounds: () => bounds,
            });
          };
        }
      }
    },
  });

  return () => clustering.setMap(null);
}
