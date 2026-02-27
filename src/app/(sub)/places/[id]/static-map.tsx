interface StaticMapProps {
  lat: string;
  lng: string;
  naverPlaceId: string;
}

export function StaticMap({ lat, lng, naverPlaceId }: StaticMapProps) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
  if (!clientId) return null;

  const mapUrl = `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=600&h=200&center=${lng},${lat}&level=16&markers=type:d|size:mid|pos:${lng} ${lat}&X-NCP-APIGW-API-KEY-ID=${clientId}`;

  return (
    <a
      href={`https://map.naver.com/p/entry/place/${naverPlaceId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl"
    >
      <img
        src={mapUrl}
        alt="장소 위치 지도"
        className="h-[150px] w-full object-cover"
      />
    </a>
  );
}
