"use client";

import { useState } from "react";
import { Flame, MessageSquarePlus, UtensilsCrossed } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ReviewSection } from "./review-section";
import { ReviewForm } from "./review-form";
import type { NaverPlaceDetail, NaverPlaceMenu } from "@/types";

const MENU_PAGE_SIZE = 10;

interface ReviewData {
  id: number;
  rating: number;
  content: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
}

interface PlaceDetailTabsProps {
  menus: NaverPlaceMenu[];
  reviews: ReviewData[];
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
  placeDetail: NaverPlaceDetail;
}

export function PlaceDetailTabs({
  menus,
  reviews,
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
  placeDetail,
}: PlaceDetailTabsProps) {
  const [visibleCount, setVisibleCount] = useState(MENU_PAGE_SIZE);
  const visibleMenus = menus.slice(0, visibleCount);
  const hasMore = menus.length > visibleCount;

  return (
    <Tabs defaultValue="review">
      <TabsList className="w-full">
        <TabsTrigger value="review" className="flex-1">
          리뷰 ({reviews.length})
        </TabsTrigger>
        <TabsTrigger value="menu" className="flex-1">
          메뉴 ({menus.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="menu" className="mt-4">
        {menus.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <UtensilsCrossed className="size-8" />
            <p className="text-sm">등록된 메뉴가 없습니다</p>
          </div>
        ) : (
          <>
            <ul className="divide-y">
              {visibleMenus.map((menu) => (
                <li key={menu.name} className="flex gap-2 py-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-bold">
                        {menu.name}
                      </div>
                      {menu.recommend && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <Flame className="size-3" />
                          추천
                        </span>
                      )}
                    </div>
                    {menu.description && (
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        {menu.description}
                      </div>
                    )}
                    {menu.price && (
                      <div className="text-sm font-medium text-muted-foreground">
                        {Number(menu.price).toLocaleString()}원
                      </div>
                    )}
                  </div>
                  {menu.images.length > 0 ? (
                    <img
                      src={menu.images[0]}
                      alt={menu.name}
                      className="size-20 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <UtensilsCrossed className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className="w-full flex justify-center">
                <Button
                  variant="secondary"
                  className="mt-3 rounded-full"
                  onClick={() =>
                    setVisibleCount((prev) => prev + MENU_PAGE_SIZE)
                  }
                >
                  메뉴 더보기 ({menus.length - visibleCount}개 더)
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="review" className="mt-4">
        {isRegistered && placeId ? (
          <ReviewSection
            placeId={placeId}
            naverPlaceId={naverPlaceId}
            reviews={reviews}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <MessageSquarePlus className="size-8" />
              <p className="text-sm">리뷰를 작성하면 장소가 등록됩니다</p>
              {currentUserId && <ReviewForm placeDetail={placeDetail} />}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
