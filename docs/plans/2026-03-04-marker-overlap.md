# 마커 겹침 처리 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 지도에서 겹치는 마커를 클릭하면 Popover 목록을 보여주고, 항목 선택 시 상세 시트를 표시한다. 부수적으로 검색 시 기본 마커 깜빡임을 수정한다.

**Architecture:** 네이버 Maps API의 픽셀 기반 좌표 변환(`fromCoordToOffset`)으로 겹침을 감지하는 순수 함수를 만들고, MapView에서 마커 클릭 시 겹침 여부를 판정하여 Popover 또는 상세 시트로 분기한다. Popover는 `fixed` 위치로 지도 위에 렌더링.

**Tech Stack:** Naver Maps JS API v3, React, shadcn/ui, Tailwind CSS v4

**Design doc:** `docs/plans/2026-03-04-marker-overlap-design.md`

---

### Task 1: Create marker overlap detection utility

**Files:**
- Create: `src/lib/marker-overlap.ts`

**Step 1: Create the overlap detection function**

```ts
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
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: 성공 (사용하는 곳이 아직 없으므로 에러 없음)

**Step 3: Commit**

```bash
git add src/lib/marker-overlap.ts
git commit -m "feat: 마커 겹침 감지 유틸리티 함수 추가"
```

---

### Task 2: Create map overlap popover component

**Files:**
- Create: `src/app/(main)/map/map-overlap-popover.tsx`

**Step 1: Create the popover component**

지도 위에 `fixed` 위치로 렌더링되는 커스텀 popover. shadcn 스타일 토큰 사용.

```tsx
"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import type { MapMarker } from "./map-view";
import { cn } from "@/lib/utils";

interface MapOverlapPopoverProps {
  items: MapMarker[];
  anchorPos: { x: number; y: number };
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function MapOverlapPopover({
  items,
  anchorPos,
  onSelect,
  onClose,
}: MapOverlapPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    // Delay to avoid closing from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose]);

  // Compute position: show above marker, adjust for viewport edges
  const style = computePosition(anchorPos, popoverRef.current);

  return (
    <div
      ref={popoverRef}
      className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 max-h-60 w-56 overflow-y-auto rounded-lg border shadow-lg"
      style={style}
    >
      <div className="p-1">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {items.length}개의 장소가 겹쳐 있습니다
        </p>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                onClick={() => onSelect(item.id)}
              >
                <MapPin className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  {item.category && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.category}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function computePosition(
  anchor: { x: number; y: number },
  el: HTMLElement | null,
): React.CSSProperties {
  const popoverWidth = 224; // w-56 = 14rem = 224px
  const popoverHeight = el?.offsetHeight ?? 200;
  const margin = 8;

  let left = anchor.x - popoverWidth / 2;
  let top = anchor.y - popoverHeight - margin;

  // Viewport edge adjustments
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  if (left < margin) left = margin;
  if (left + popoverWidth > vw - margin) left = vw - popoverWidth - margin;
  if (top < margin) top = anchor.y + 28 + margin; // show below marker instead

  return { left, top };
}
```

**Key design decisions:**
- `fixed z-50` — 지도 위에 렌더링
- `w-56 max-h-60 overflow-y-auto` — 겹침 마커가 많을 때 스크롤
- `animate-in fade-in-0 zoom-in-95` — shadcn 스타일 진입 애니메이션
- `computePosition` — 마커 위에 표시, 뷰포트 가장자리 보정
- `pointerdown` outside click 감지로 닫힘

**Step 2: Verify build**

Run: `pnpm build`
Expected: 성공

**Step 3: Commit**

```bash
git add src/app/(main)/map/map-overlap-popover.tsx
git commit -m "feat: 겹침 마커 Popover UI 컴포넌트 추가"
```

---

### Task 3: Integrate overlap detection into MapView

**Files:**
- Modify: `src/app/(main)/map/map-view.tsx`

**Step 1: Add new props and imports**

```ts
// Add import at top
import { getOverlappingMarkers } from "@/lib/marker-overlap";
```

Add to `MapViewProps`:
```ts
interface MapViewProps {
  markers: MapMarker[];
  fitBoundsPadding?: Padding;
  focusPadding?: Padding;
  focusMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onOverlapClick?: (markers: MapMarker[], anchorPos: { x: number; y: number }) => void;
  onDragEnd?: () => void;
  onMapClick?: () => void;
  className?: string;
}
```

Destructure the new props in the component.

**Step 2: Update marker click handler in `renderMarkers`**

Replace the current click listener logic (inside `markers.forEach`) with overlap detection:

```ts
naver.maps.Event.addListener(marker, "click", () => {
  const map = mapRef.current;
  if (!map) return;

  const overlapping = getOverlappingMarkers(
    map,
    marker,
    markerInstancesRef.current,
  );

  if (overlapping.length > 0 && onOverlapClickRef.current) {
    // Build MapMarker[] for all overlapping markers (including clicked one)
    const allOverlapping = [marker, ...overlapping];
    const overlapItems = allOverlapping
      .map((m) => {
        const idx = markerInstancesRef.current.indexOf(m);
        return idx >= 0 ? markersRef.current[idx] : null;
      })
      .filter((item): item is MapMarker => item !== null);

    // Get screen position from marker DOM element
    const el = marker.getElement();
    const rect = el?.getBoundingClientRect();
    const anchorPos = rect
      ? { x: rect.left + rect.width / 2, y: rect.top }
      : { x: 0, y: 0 };

    onOverlapClickRef.current(overlapItems, anchorPos);
  } else {
    onMarkerClickRef.current?.(data.id);
  }
});
```

**Step 3: Add refs for new callbacks (avoid stale closures)**

```ts
const onMarkerClickRef = useRef(onMarkerClick);
const onOverlapClickRef = useRef(onOverlapClick);
const onMapClickRef = useRef(onMapClick);

useEffect(() => { onMarkerClickRef.current = onMarkerClick; }, [onMarkerClick]);
useEffect(() => { onOverlapClickRef.current = onOverlapClick; }, [onOverlapClick]);
useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
```

Remove `onMarkerClick` from `renderMarkers` dependency array (replaced by ref).

**Step 4: Add map click listener in `handleReady`**

Inside `handleReady`, after the existing drag listeners:

```ts
const clickListener = naver.maps.Event.addListener(map, "click", () => {
  onMapClickRef.current?.();
});
```

Add to cleanup:
```ts
return () => {
  naver.maps.Event.removeListener(dragStartListener);
  naver.maps.Event.removeListener(dragEndListener);
  naver.maps.Event.removeListener(clickListener);
  clearMarkers();
  mapRef.current = null;
};
```

**Step 5: Verify build**

Run: `pnpm build`
Expected: 성공

**Step 6: Commit**

```bash
git add src/app/(main)/map/map-view.tsx
git commit -m "feat: MapView에 마커 겹침 감지 및 맵 클릭 콜백 통합"
```

---

### Task 4: Wire up overlap popover + fix search flash in MapContainer

**Files:**
- Modify: `src/app/(main)/map/map-container.tsx`

**Step 1: Add overlap popover state and import**

```ts
import { MapOverlapPopover } from "./map-overlap-popover";
```

Add state:
```ts
const [overlapState, setOverlapState] = useState<{
  items: MapMarker[];
  anchorPos: { x: number; y: number };
} | null>(null);
```

**Step 2: Add overlap click handler**

```ts
const handleOverlapClick = useCallback(
  (items: MapMarker[], anchorPos: { x: number; y: number }) => {
    setOverlapState({ items, anchorPos });
  },
  [],
);

const handleOverlapSelect = useCallback(
  (id: string) => {
    setOverlapState(null);
    handleMarkerClick(id);
  },
  [handleMarkerClick],
);

const handleOverlapClose = useCallback(() => {
  setOverlapState(null);
}, []);
```

**Step 3: Close popover on map interactions**

Add `setOverlapState(null)` to existing handlers:
- `handleDragEnd`: add `setOverlapState(null);` before `setMapMoved(true);`
- `handleClear`: add `setOverlapState(null);`
- Add `onMapClick={handleOverlapClose}` to `<MapView>` props.

**Step 4: Fix search flash — update markers prop**

Replace:
```ts
markers={showSheet && hasResults ? activeMarkers : defaultMarkers}
```

With:
```ts
const displayMarkers = isSearching
  ? showSheet && hasResults
    ? activeMarkers
    : []
  : defaultMarkers;
```

```tsx
markers={displayMarkers}
```

**Step 5: Fix fitBoundsPadding to match**

Replace:
```ts
fitBoundsPadding={
  showSheet && hasResults && !selectedItem && !searchCoords
    ? sheetPadding
    : !showSheet && defaultMarkers.length > 0
      ? defaultPadding
      : undefined
}
```

With:
```ts
fitBoundsPadding={
  showSheet && hasResults && !selectedItem && !searchCoords
    ? sheetPadding
    : !isSearching && defaultMarkers.length > 0
      ? defaultPadding
      : undefined
}
```

**Step 6: Pass new props to MapView**

```tsx
<MapView
  ref={mapViewRef}
  markers={displayMarkers}
  fitBoundsPadding={...}
  focusPadding={selectedItem ? sheetPadding : undefined}
  focusMarkerId={focusMarkerId}
  onMarkerClick={handleMarkerClick}
  onOverlapClick={handleOverlapClick}
  onDragEnd={handleDragEnd}
  onMapClick={handleOverlapClose}
  className="fixed inset-x-0 top-0 bottom-15"
/>
```

**Step 7: Render overlap popover**

Add after the `<MapView>` element, before `<MapSearchInput>`:

```tsx
{overlapState && (
  <MapOverlapPopover
    items={overlapState.items}
    anchorPos={overlapState.anchorPos}
    onSelect={handleOverlapSelect}
    onClose={handleOverlapClose}
  />
)}
```

**Step 8: Verify build**

Run: `pnpm build`
Expected: 성공

**Step 9: Commit**

```bash
git add src/app/(main)/map/map-container.tsx
git commit -m "feat: 겹침 마커 Popover 연동 및 검색 시 기본 마커 깜빡임 수정"
```

---

### Task 5: Manual verification

1. `/map` 진입 → 등록된 모든 장소 마커 표시 (기존과 동일)
2. 마커 확대 → 겹치는 마커 클릭 → Popover에 겹침 장소 목록 표시
3. Popover 항목 클릭 → Popover 닫히고 상세 시트 표시
4. 지도 드래그 → Popover 닫힘
5. 지도 빈 곳 클릭 → Popover 닫힘
6. 겹치지 않는 마커 클릭 → 기존처럼 바로 상세 시트 표시
7. 검색어 입력 → 검색 결과 마커만 표시 (기본 마커 깜빡임 없음)
8. 검색 클리어 → 다시 전체 장소 마커 표시
9. "현 지도에서 검색" → 기본 마커 깜빡임 없이 검색 결과 표시
