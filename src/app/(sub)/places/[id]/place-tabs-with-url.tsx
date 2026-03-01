"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlaceTabs } from "@/components/place-detail/place-tabs";
import type { MenusResponse } from "@/components/place-detail/use-menus";
import type { ReviewsResponse } from "@/components/place-detail/use-reviews";

interface PlaceTabsWithUrlProps {
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
  initialMenus: MenusResponse;
  initialReviews: ReviewsResponse;
}

export function PlaceTabsWithUrl({
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
  initialMenus,
  initialReviews,
}: PlaceTabsWithUrlProps) {
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
    <div ref={tabsRef}>
      <PlaceTabs
        isRegistered={isRegistered}
        placeId={placeId}
        naverPlaceId={naverPlaceId}
        currentUserId={currentUserId}
        initialMenus={initialMenus}
        initialReviews={initialReviews}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
