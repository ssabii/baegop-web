/**
 * 네이버 Maps API의 픽셀 기반 바운딩 박스로 겹치는 마커를 찾는다.
 * 클러스터링에 의해 숨겨진 마커(map === null)는 제외.
 *
 * @param map - 네이버 맵 인스턴스
 * @param target - 클릭된 마커
 * @param allMarkers - 전체 마커 배열
 * @param tolerance - 겹침 판정 반경 (px, 기본 14)
 * @returns target과 겹치는 마커 배열 (target 제외)
 */
export function getOverlappingMarkers(
  map: naver.maps.Map,
  target: naver.maps.Marker,
  allMarkers: naver.maps.Marker[],
  tolerance = 14,
): naver.maps.Marker[] {
  const proj = map.getProjection();
  const targetOffset = proj.fromCoordToOffset(target.getPosition());
  const targetBounds = naver.maps.PointBounds.bounds(
    targetOffset.clone().sub(tolerance, tolerance),
    targetOffset.clone().add(tolerance, tolerance),
  );

  return allMarkers.filter((m) => {
    if (m === target || m.getMap() === null) return false;
    const offset = proj.fromCoordToOffset(m.getPosition());
    const bounds = naver.maps.PointBounds.bounds(
      offset.clone().sub(tolerance, tolerance),
      offset.clone().add(tolerance, tolerance),
    );
    return bounds.intersects(targetBounds);
  });
}
