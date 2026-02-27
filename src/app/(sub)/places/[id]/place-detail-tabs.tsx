"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MenuSection } from "./menu-section";
import { ReviewSection } from "./review-section";
import type { MenusResponse } from "./use-menus";
import type { ReviewsResponse } from "./use-reviews";

interface PlaceDetailTabsProps {
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
  initialMenus: MenusResponse;
  initialReviews?: ReviewsResponse;
}

export function PlaceDetailTabs({
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
  initialMenus,
  initialReviews,
}: PlaceDetailTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("scrollToReview") === "true") {
      sessionStorage.removeItem("scrollToReview");
      tabsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <Tabs ref={tabsRef} defaultValue="review" className="scroll-mt-16">
      <TabsList className="w-full">
        <TabsTrigger value="review" className="flex-1 cursor-pointer">
          리뷰
        </TabsTrigger>
        <TabsTrigger value="menu" className="flex-1 cursor-pointer">
          메뉴
        </TabsTrigger>
      </TabsList>

      <TabsContent value="menu" className="mt-4">
        <MenuSection naverPlaceId={naverPlaceId} initialData={initialMenus} />
      </TabsContent>

      <TabsContent value="review" className="mt-4">
        {isRegistered && placeId ? (
          <ReviewSection
            placeId={placeId}
            naverPlaceId={naverPlaceId}
            currentUserId={currentUserId}
            initialData={initialReviews}
          />
        ) : (
          <Empty className="border-none py-12">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-none bg-transparent"
              >
                <MessageCircle className="size-12 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">
                작성된 리뷰가 없어요
              </EmptyTitle>
              <EmptyDescription>첫 번째 리뷰를 남겨보세요!</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </TabsContent>
    </Tabs>
  );
}
