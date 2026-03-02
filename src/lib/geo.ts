/** Haversine 공식으로 두 좌표 사이 직선 거리(m) 계산 */
export function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 6371000; // 지구 반지름 (m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 도보 시간 추정 (평균 80m/min 기준) */
export function estimateWalkingMinutes(meters: number): number {
  return Math.round(meters / 80);
}

/** 거리를 사람이 읽기 쉬운 문자열로 (ex: "512m", "1.2km") */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters).toLocaleString()}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/** 도보 시간을 사람이 읽기 쉬운 문자열로 (ex: "5분", "1시간 10분") */
export function formatWalkingDuration(minutes: number): string {
  if (minutes === 0) {
    return "근처";
  }
  if (minutes >= 30) {
    return "30분 이상";
  }
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${remainingMinutes}분`;
}
