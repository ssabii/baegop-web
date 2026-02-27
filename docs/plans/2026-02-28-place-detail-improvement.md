# 장소 상세 개선 (BAE-12) 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 장소 상세 페이지의 UX/UI를 9가지 항목에 걸쳐 개선한다.

**Architecture:** 대부분 기존 컴포넌트의 수정으로 처리한다. 바로가기 버튼은 서버 컴포넌트(`page.tsx`)에 직접 추가하고, 코나카드/툴팁 관련은 클라이언트 컴포넌트를 수정한다. shadcn Tooltip 컴포넌트를 새로 설치한다.

**Tech Stack:** Next.js (App Router, RSC), shadcn/ui (Toggle, Drawer, Tooltip), Tailwind CSS v4, 네이버 Static Map API

---

### Task 1: 0분 → "근처" 표현

**Files:**
- Modify: `src/lib/geo.ts:33` (`formatWalkingDuration`)

**Step 1: 수정**

`formatWalkingDuration`에서 0분일 때 "근처"를 반환하도록 early return을 추가한다.

```ts
export function formatWalkingDuration(minutes: number): string {
  if (minutes === 0) {
    return "근처";
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
```

**Step 2: 커밋**

```bash
git add src/lib/geo.ts
git commit -m "fix: 도보 0분일 때 '근처'로 표시"
```

---

### Task 2: 이미지 미리보기 인덱스 버그 수정

**Files:**
- Modify: `src/components/image-preview-dialog.tsx:28-30`

**Step 1: 수정**

`ImageCarouselDialog` 컴포넌트에서 `open`이 `true`로 변경될 때 `initialIndex`로 `current`를 리셋하고, carousel API도 해당 인덱스로 스크롤한다.

기존 코드:
```ts
const [current, setCurrent] = useState(initialIndex);
```

변경 — `open` 변경 시 리셋하는 useEffect를 추가한다:

```ts
const [current, setCurrent] = useState(initialIndex);

// open 시 initialIndex로 리셋
useEffect(() => {
  if (open) {
    setCurrent(initialIndex);
    api?.scrollTo(initialIndex, false);
  }
}, [open, initialIndex, api]);
```

**Step 2: 커밋**

```bash
git add src/components/image-preview-dialog.tsx
git commit -m "fix: 이미지 미리보기에서 첫번째가 아닌 이미지 클릭 시 인덱스가 제대로 표현되지 않는 이슈 수정"
```

---

### Task 3: 메뉴탭 순서 변경 + 갯수 표시

**Files:**
- Modify: `src/app/(sub)/places/[id]/place-detail-tabs.tsx`
- Modify: `src/app/(sub)/places/[id]/page.tsx` (reviewCount, menuCount prop 전달)

**Step 1: PlaceDetailTabs props에 reviewCount, menuCount 추가**

`place-detail-tabs.tsx`에서:

1. `PlaceDetailTabsProps`에 `reviewCount: number` 추가
2. `defaultValue`를 `"menu"`로 변경
3. TabsTrigger 순서를 메뉴 → 리뷰로 변경
4. 각 탭 라벨에 갯수 표시 (1 이상일 때)

```tsx
interface PlaceDetailTabsProps {
  menus: NaverPlaceMenu[];
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
  reviewCount: number;
}
```

```tsx
<Tabs ref={tabsRef} defaultValue="menu">
  <TabsList className="w-full">
    <TabsTrigger value="menu" className="flex-1 cursor-pointer">
      메뉴{menus.length > 0 && ` (${menus.length})`}
    </TabsTrigger>
    <TabsTrigger value="review" className="flex-1 cursor-pointer">
      리뷰{reviewCount > 0 && ` (${reviewCount})`}
    </TabsTrigger>
  </TabsList>

  <TabsContent value="menu" className="mt-4">
    {/* ... 기존 메뉴 내용 ... */}
  </TabsContent>

  <TabsContent value="review" className="mt-4">
    {/* ... 기존 리뷰 내용 ... */}
  </TabsContent>
</Tabs>
```

**Step 2: page.tsx에서 reviewCount 전달**

```tsx
<PlaceDetailTabs
  menus={detail.menus}
  isRegistered={isRegistered}
  placeId={place?.id ?? null}
  naverPlaceId={naverPlaceId}
  currentUserId={user?.id ?? null}
  reviewCount={reviewCount}
/>
```

**Step 3: 커밋**

```bash
git add src/app/\(sub\)/places/\[id\]/place-detail-tabs.tsx src/app/\(sub\)/places/\[id\]/page.tsx
git commit -m "feat: 메뉴탭을 리뷰보다 먼저 배치하고 갯수 표시"
```

---

### Task 4: 바로가기 버튼 탭

**Files:**
- Modify: `src/app/(sub)/places/[id]/page.tsx`

**Step 1: 기존 ExternalLink 아이콘 제거**

`page.tsx`에서 다음을 제거한다:
- 주소 옆 `ExternalLink` 아이콘 (line 139-147)
- 도보거리 옆 `ExternalLink` 아이콘 (line 162-174)
- 전화번호 `<a href="tel:">` 링크 (line 177-184)

**Step 2: 바로가기 버튼 영역 추가**

기본 정보 `</section>` 바로 아래, 코나카드 섹션 위에 버튼 그룹을 추가한다. 4개의 세로 버튼을 가로 배치한다.

```tsx
import {
  ExternalLink as ExternalLinkIcon,
  MapPin,
  Map,
  Route,
  Phone,
  // ... 기타 기존 import
} from "lucide-react";
```

```tsx
{/* 바로가기 버튼 */}
<section className="flex gap-2">
  <a
    href={naverLink}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-muted py-3 text-muted-foreground transition-colors active:bg-accent"
  >
    <ExternalLinkIcon className="size-5" />
    <span className="text-xs font-medium">장소보기</span>
  </a>
  <a
    href={`https://map.naver.com/p/entry/place/${naverPlaceId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-muted py-3 text-muted-foreground transition-colors active:bg-accent"
  >
    <Map className="size-5" />
    <span className="text-xs font-medium">지도보기</span>
  </a>
  {walkingRoute && (
    <a
      href={buildNaverWalkingRouteLink(COMPANY_LOCATION, {
        lng: Number(detail.x),
        lat: Number(detail.y),
        name: detail.name,
        placeId: naverPlaceId,
      })}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-muted py-3 text-muted-foreground transition-colors active:bg-accent"
    >
      <Route className="size-5" />
      <span className="text-xs font-medium">경로보기</span>
    </a>
  )}
  {detail.phone && (
    <a
      href={`tel:${detail.phone}`}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-muted py-3 text-muted-foreground transition-colors active:bg-accent"
    >
      <Phone className="size-5" />
      <span className="text-xs font-medium">전화걸기</span>
    </a>
  )}
</section>
```

**Step 3: 커밋**

```bash
git add src/app/\(sub\)/places/\[id\]/page.tsx
git commit -m "feat: 링크 바로가기를 버튼 탭으로 변경"
```

---

### Task 5: 코나카드 투표 토글 + 인포 아이콘 바텀시트

**Files:**
- Modify: `src/app/(sub)/places/[id]/kona-vote.tsx`

**Step 1: 투표 버튼을 Toggle로 변경 + 인포 아이콘 추가**

기존 Button 2개를 shadcn Toggle로 변경하고, 인포 아이콘을 누르면 Drawer(바텀시트)가 열리도록 한다.

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { Spinner } from "@/components/ui/spinner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useKonaVote } from "./use-kona-vote";
import type { KonaCardStatus, KonaVote } from "@/types";

interface KonaVoteProps {
  placeId: string;
  status: KonaCardStatus;
  userVote: KonaVote | null;
  isLoggedIn: boolean;
}

const STATUS_CONFIG: Record<
  KonaCardStatus,
  { label: string; className: string }
> = {
  available: {
    label: "결제 가능",
    className: "text-purple-700 dark:text-purple-300",
  },
  unavailable: {
    label: "결제 불가",
    className: "text-muted-foreground",
  },
  unknown: {
    label: "미확인",
    className: "text-muted-foreground",
  },
};

export function KonaVoteSection({
  placeId,
  status: initialStatus,
  userVote: initialUserVote,
  isLoggedIn,
}: KonaVoteProps) {
  const router = useRouter();
  const { status, userVote, vote, isPending } = useKonaVote({
    placeId,
    initialStatus,
    initialUserVote,
    onSuccess: () => router.refresh(),
  });

  const config = STATUS_CONFIG[status];

  return (
    <section className="rounded-xl bg-muted p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/kona.png" alt="코나카드" className="size-4" />
          <span className="text-sm font-bold">코나카드</span>
        </div>
        <span className={cn("text-sm font-semibold", config.className)}>
          {config.label}
        </span>
      </div>

      {isLoggedIn && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              코나카드 결제가 가능한가요?
            </span>
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer text-muted-foreground"
                  aria-label="코나카드 안내"
                >
                  <Info className="size-4" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>코나카드 결제 여부</DrawerTitle>
                  <DrawerDescription>
                    코나카드 결제가 가능하다면 동료가 알 수 있게 투표해주세요.
                  </DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </div>
          <div className="flex items-center gap-1.5">
            <Toggle
              variant="outline"
              size="sm"
              pressed={userVote === "available"}
              onPressedChange={() => vote("available")}
              disabled={isPending}
              aria-label="결제 가능"
            >
              {isPending && userVote === "available" ? (
                <Spinner />
              ) : (
                <Check
                  className={cn({
                    "fill-foreground": userVote === "available",
                  })}
                />
              )}
              가능
            </Toggle>
            <Toggle
              variant="outline"
              size="sm"
              pressed={userVote === "unavailable"}
              onPressedChange={() => vote("unavailable")}
              disabled={isPending}
              aria-label="결제 불가"
            >
              {isPending && userVote === "unavailable" ? (
                <Spinner />
              ) : (
                <Check
                  className={cn({
                    "fill-foreground": userVote === "unavailable",
                  })}
                />
              )}
              불가
            </Toggle>
          </div>
        </div>
      )}
    </section>
  );
}
```

**Step 2: 커밋**

```bash
git add src/app/\(sub\)/places/\[id\]/kona-vote.tsx
git commit -m "feat: 코나카드 투표를 토글로 변경하고 인포 바텀시트 추가"
```

---

### Task 6: 스태틱 맵

**Files:**
- Create: `src/app/(sub)/places/[id]/static-map.tsx`
- Modify: `src/app/(sub)/places/[id]/page.tsx`

**Step 1: 스태틱 맵 컴포넌트 생성**

네이버 Static Map API를 사용하여 장소 위치를 표시하는 서버 컴포넌트를 만든다. 클릭 시 네이버 지도로 이동한다.

네이버 Static Map API URL 형식:
`https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w={width}&h={height}&center={lng},{lat}&level={zoom}&markers=type:d|size:mid|pos:{lng} {lat}&X-NCP-APIGW-API-KEY-ID={clientId}`

```tsx
// src/app/(sub)/places/[id]/static-map.tsx
import Link from "next/link";

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
```

**Step 2: page.tsx에서 StaticMap 추가**

코나카드 섹션 아래, 탭 섹션 위에 배치한다.

```tsx
import { StaticMap } from "./static-map";

// ... 코나카드 섹션 아래에:
{/* 스태틱 맵 */}
<StaticMap
  lat={detail.y}
  lng={detail.x}
  naverPlaceId={naverPlaceId}
/>
```

**Step 3: 커밋**

```bash
git add src/app/\(sub\)/places/\[id\]/static-map.tsx src/app/\(sub\)/places/\[id\]/page.tsx
git commit -m "feat: 장소 상세에 스태틱 맵 추가"
```

---

### Task 7: shadcn Tooltip 설치 + 미등록 장소 유도 툴팁

**Files:**
- Install: `pnpm dlx shadcn@latest add tooltip`
- Modify: `src/app/(sub)/places/[id]/place-action-bar.tsx`

**Step 1: shadcn Tooltip 설치**

```bash
pnpm dlx shadcn@latest add tooltip
```

**Step 2: 미등록 장소에서 유도 툴팁 표시**

`place-action-bar.tsx`에서 미등록 장소일 때 "장소 등록" 버튼 위에 "배곱에 장소를 등록해보세요" 툴팁을 자동 표시한다. localStorage로 한 번 닫으면 다시 보이지 않게 한다.

shadcn Tooltip은 마우스 호버 기반이라 모바일에서 자동 노출이 어렵다. 대신 CSS 기반 말풍선(커스텀)으로 구현하거나, `open` 상태를 직접 제어하는 방식으로 구현한다.

```tsx
// place-action-bar.tsx 내부에 추가
const [showTooltip, setShowTooltip] = useState(() => {
  if (typeof window === "undefined") return false;
  return !isRegistered && !localStorage.getItem("hideRegisterTooltip");
});

function dismissTooltip() {
  setShowTooltip(false);
  localStorage.setItem("hideRegisterTooltip", "true");
}
```

장소 등록 버튼 위에 커스텀 말풍선을 추가한다:

```tsx
{!isRegistered && (
  <div className="relative">
    {showTooltip && (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg">
        배곱에 장소를 등록해보세요
        <button
          type="button"
          onClick={dismissTooltip}
          className="ml-1.5 cursor-pointer text-background/70"
          aria-label="닫기"
        >
          ✕
        </button>
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    )}
    <Button
      variant="outline"
      size="xl"
      className="w-full transition-none has-[>svg]:px-8"
      onClick={handleRegister}
      disabled={isPending}
    >
      {isPending && pendingAction === "register" && <Spinner />}
      장소 등록
    </Button>
  </div>
)}
```

장소 등록 성공 시 토스트는 이미 구현되어 있으므로 변경하지 않는다.

**Step 3: 커밋**

```bash
git add src/components/ui/tooltip.tsx src/app/\(sub\)/places/\[id\]/place-action-bar.tsx
git commit -m "feat: 미등록 장소에서 등록 유도 툴팁 표시"
```

---

### Task 8: 수동 검증

**Step 1: 개발 서버에서 모든 변경사항 확인**

```bash
pnpm dev
```

브라우저에서 다음을 확인한다:
- [ ] 바로가기 버튼 4개 (장소보기, 지도보기, 경로보기, 전화걸기) 정상 동작
- [ ] 도보 0분인 경우 "근처" 표시
- [ ] 스태틱 맵 이미지 표시 + 클릭 시 네이버 지도 이동
- [ ] 메뉴탭이 리뷰탭보다 먼저 표시되고 갯수 표시
- [ ] 이미지 갤러리에서 2번째 이미지 클릭 시 올바른 인덱스로 미리보기 표시
- [ ] 코나카드 인포 아이콘 클릭 → 바텀시트 표시
- [ ] 코나카드 투표가 Toggle로 동작
- [ ] 미등록 장소에서 유도 툴팁 표시 + 닫기 + localStorage 저장

**Step 2: 빌드 확인**

```bash
pnpm build
```

**Step 3: 최종 커밋 (lint 수정 등 필요시)**
