"use client";

import { useState } from "react";
import { Flame, MessageSquare, UtensilsCrossed } from "lucide-react";
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
  placeId: number | null;
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
  const [showAllMenus, setShowAllMenus] = useState(false);
  const visibleMenus = showAllMenus ? menus : menus.slice(0, MENU_PAGE_SIZE);
  const hasMore = menus.length > MENU_PAGE_SIZE;

  return (
    <Tabs defaultValue={menus.length > 0 ? "menu" : "review"}>
      <TabsList className="w-full">
        {menus.length > 0 && (
          <TabsTrigger value="menu" className="flex-1 gap-1.5">
            <UtensilsCrossed className="size-4" />
            메뉴 ({menus.length})
          </TabsTrigger>
        )}
        <TabsTrigger value="review" className="flex-1 gap-1.5">
          <MessageSquare className="size-4" />
          리뷰 ({reviews.length})
        </TabsTrigger>
      </TabsList>

      {menus.length > 0 && (
        <TabsContent value="menu" className="mt-4">
          <ul className="divide-y rounded-lg border">
            {visibleMenus.map((menu) => (
              <li key={menu.name} className="flex items-center gap-3 px-4 py-3">
                {menu.images.length > 0 ? (
                  <img
                    src={menu.images[0]}
                    alt={menu.name}
                    className="size-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                    <UtensilsCrossed className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{menu.name}</span>
                      {menu.recommend && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <Flame className="size-3" />
                          추천
                        </span>
                      )}
                    </div>
                    {menu.description && (
                      <span className="text-xs text-muted-foreground">
                        {menu.description}
                      </span>
                    )}
                  </div>
                  {menu.price && (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {Number(menu.price).toLocaleString()}원
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {hasMore && !showAllMenus && (
            <Button
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => setShowAllMenus(true)}
            >
              메뉴 더보기 ({menus.length - MENU_PAGE_SIZE}개 더)
            </Button>
          )}
        </TabsContent>
      )}

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
            <div className="rounded-lg border border-dashed p-4">
              <p className="text-sm font-medium">
                리뷰를 작성하면 장소가 등록됩니다
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                첫 리뷰를 남겨주세요!
              </p>
            </div>
            {currentUserId && <ReviewForm placeDetail={placeDetail} />}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
