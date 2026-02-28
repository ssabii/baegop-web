"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuSection } from "./menu-section";
import { ReviewSection } from "./review-section";
import type { MenusResponse } from "./use-menus";
import type { ReviewsResponse } from "./use-reviews";

interface PlaceTabsProps {
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
  defaultTab: "menu" | "review";
  initialMenus: MenusResponse;
  initialReviews?: ReviewsResponse;
}

export function PlaceTabs({
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
  defaultTab,
  initialMenus,
  initialReviews,
}: PlaceTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (defaultTab === "review") {
      tabsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [defaultTab]);

  function handleTabChange(value: string) {
    const params = value === "menu" ? pathname : `${pathname}?tab=review`;
    router.replace(params, { scroll: false });
  }

  return (
    <Tabs ref={tabsRef} defaultValue={defaultTab} onValueChange={handleTabChange} className="gap-4">
      <TabsList className="w-full">
        <TabsTrigger value="menu" className="flex-1 cursor-pointer">
          메뉴
        </TabsTrigger>
        <TabsTrigger value="review" className="flex-1 cursor-pointer">
          리뷰
        </TabsTrigger>
      </TabsList>

      <TabsContent value="menu">
        <MenuSection naverPlaceId={naverPlaceId} initialData={initialMenus} />
      </TabsContent>

      <TabsContent value="review">
        <ReviewSection
          placeId={placeId}
          naverPlaceId={naverPlaceId}
          currentUserId={currentUserId}
          isRegistered={isRegistered}
          initialData={initialReviews}
        />
      </TabsContent>
    </Tabs>
  );
}
