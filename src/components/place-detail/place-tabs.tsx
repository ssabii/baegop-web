"use client";

import { useState } from "react";
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
  initialMenus?: MenusResponse;
  initialReviews?: ReviewsResponse;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function PlaceTabs({
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
  initialMenus,
  initialReviews,
  activeTab: controlledTab,
  onTabChange,
}: PlaceTabsProps) {
  const [internalTab, setInternalTab] = useState("menu");

  const activeTab = controlledTab ?? internalTab;

  function handleTabChange(value: string) {
    if (onTabChange) {
      onTabChange(value);
    } else {
      setInternalTab(value);
    }
  }

  return (
    <Tabs
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
