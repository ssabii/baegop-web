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
    }) => { setMap: (map: naver.maps.Map | null) => void };
  }
}

interface MarkerClusteringOptions {
  map: naver.maps.Map;
  markers: naver.maps.Marker[];
  gridSize?: number;
  maxZoom?: number;
  minClusterSize?: number;
}

function createClusterIcon(size: number): {
  content: string;
  size: naver.maps.Size;
  anchor: naver.maps.Point;
} {
  const half = size / 2;
  return {
    content: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:oklch(var(--primary));color:oklch(var(--primary-foreground));display:flex;align-items:center;justify-content:center;font-size:${size < 44 ? 12 : 14}px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;"></div>`,
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
}: MarkerClusteringOptions): () => void {
  const clustering = new window.MarkerClustering({
    map,
    markers,
    gridSize,
    maxZoom,
    minClusterSize,
    icons: [createClusterIcon(36), createClusterIcon(44), createClusterIcon(54)],
    indexGenerator: [10, 50, Infinity],
    stylingFunction: (clusterMarker, count) => {
      const el = clusterMarker.getElement();
      const div = el?.querySelector("div");
      if (div) div.textContent = String(count);
    },
  });

  return () => clustering.setMap(null);
}
