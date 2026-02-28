"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  initialMenus: MenusResponse;
  initialReviews: ReviewsResponse;
}

export function PlaceTabs({
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
  initialMenus,
  initialReviews,
}: PlaceTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab");
  const activeTab = tab === "review" ? "review" : "menu";

  useEffect(() => {
    const scrollToReview = sessionStorage.getItem("scrollToReview");
    if (scrollToReview === "true") {
      sessionStorage.removeItem("scrollToReview");
      tabsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  function handleTabChange(value: string) {
    router.replace(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <Tabs
      ref={tabsRef}
      value={activeTab}
      onValueChange={handleTabChange}
      className="gap-4"
    >
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
