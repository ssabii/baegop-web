"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuSection } from "./menu-section";
import { ReviewSection } from "./review-section";
import type { NaverPlaceMenu } from "@/types";

interface PlaceTabsProps {
  menus: NaverPlaceMenu[];
  reviewCount: number;
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
  defaultTab: "menu" | "review";
}

export function PlaceTabs({
  menus,
  reviewCount,
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
  defaultTab,
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
          메뉴{menus.length > 0 ? ` (${menus.length})` : ""}
        </TabsTrigger>
        <TabsTrigger value="review" className="flex-1 cursor-pointer">
          리뷰{reviewCount > 0 ? ` (${reviewCount})` : ""}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="menu">
        <MenuSection menus={menus} />
      </TabsContent>

      <TabsContent value="review">
        <ReviewSection
          placeId={placeId}
          naverPlaceId={naverPlaceId}
          currentUserId={currentUserId}
          isRegistered={isRegistered}
        />
      </TabsContent>
    </Tabs>
  );
}
