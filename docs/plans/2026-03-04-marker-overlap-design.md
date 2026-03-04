# 지도 마커 겹침 처리 설계

## 배경

`/map` 페이지에서 클러스터링 max zoom(15) 이상으로 확대하면 개별 마커가 겹쳐서 표시됨.
네이버 Maps API의 MarkerOverlapRecognizer 패턴을 적용하되 UI는 프로젝트 컴포넌트로 구현.

## 결정 사항

- **트리거**: 마커 클릭(tap) — 모바일 우선
- **UI**: shadcn Popover로 겹침 마커 목록 표시
- **항목 클릭**: 상세 시트(MapPlaceDetailSheet) 표시
- **접근 방식**: 네이버 MarkerOverlapRecognizer 로직 내재화 + 커스텀 Popover UI

## 아키텍처

```
마커 클릭
  → MarkerOverlapRecognizer로 겹침 마커 조회
  → 겹침 있음: Popover 목록 표시
    → 항목 클릭: Popover 닫기 + 상세 시트
  → 겹침 없음: 기존 상세 시트로 이동
```

## 신규 파일

### `src/lib/marker-overlap.ts`

네이버 튜토리얼의 핵심 겹침 감지 로직만 추출. UI 렌더링 제거.

```ts
interface OverlapRecognizer {
  setMap(map: naver.maps.Map | null): void;
  setMarkers(markers: naver.maps.Marker[]): void;
  getOverlappingMarkers(marker: naver.maps.Marker): naver.maps.Marker[];
}
```

- 픽셀 기반 바운딩 박스 겹침 판정
- tolerance: 5px
- 줌/이동 이벤트에 따라 자동 재계산 불필요 (클릭 시점에 실시간 계산)

### `src/app/(main)/map/map-overlap-popover.tsx`

겹침 마커 Popover 컴포넌트.

- shadcn Popover 사용
- 지도 위 absolute positioning (마커 클릭 위치 기준)
- 각 항목: 장소 이름 + 카테고리 (1줄), 클릭 가능
- 지도 이동/줌/다른 곳 클릭 시 닫힘

## 수정 파일

### `src/app/(main)/map/map-view.tsx`

- MarkerOverlapRecognizer 인스턴스 관리 (마커 렌더 시 함께 설정)
- 마커 클릭 시 겹침 판정:
  - 겹침 있음 → `onOverlapClick(markers, anchorPos)` 콜백
  - 겹침 없음 → 기존 `onMarkerClick(id)` 콜백
- 새 prop: `onOverlapClick?: (markers: MapMarker[], anchorPos: { x: number; y: number }) => void`

### `src/app/(main)/map/map-container.tsx`

- overlap popover 상태 관리 (열림/닫힘, 위치, 마커 목록)
- popover 항목 클릭 → `handleMarkerClick` 호출
- 검색 시 기본 마커 깜빡임 수정:
  ```ts
  const displayMarkers = isSearching
    ? (hasResults ? activeMarkers : [])
    : defaultMarkers;
  ```

## 부수 수정: 검색 시 기본 마커 깜빡임

현재 markers prop 전환 로직에서 검색 로딩 중 `showSheet`가 false가 되면서
잠깐 `defaultMarkers`가 보이는 문제. `isSearching` 기준으로 전환하여 수정.
