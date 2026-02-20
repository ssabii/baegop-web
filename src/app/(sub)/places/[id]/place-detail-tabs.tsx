"use client";

import { useState } from "react";
import { Flame, MessageSquarePlus, UtensilsCrossed } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReviewSection } from "./review-section";
import type { NaverPlaceMenu } from "@/types";

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
  review_images: {
    url: string;
    display_order: number;
  }[];
}

interface PlaceDetailTabsProps {
  menus: NaverPlaceMenu[];
  reviews: ReviewData[];
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
}

export function PlaceDetailTabs({
  menus,
  reviews,
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
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
          <Empty className="border-none py-12">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-none bg-transparent"
              >
                <UtensilsCrossed className="size-12 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">
                등록된 메뉴가 없습니다
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ul className="divide-y">
              {visibleMenus.map((menu) => (
                <li key={menu.name} className="flex gap-2 py-3">
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="space-y-0.5">
                      {menu.recommend && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <Flame className="size-3" />
                          추천
                        </span>
                      )}
                      <div className="truncate text-sm font-bold">
                        {menu.name}
                      </div>
                      {menu.description && (
                        <div className="line-clamp-2 text-sm text-muted-foreground">
                          {menu.description}
                        </div>
                      )}
                    </div>
                    {menu.price && (
                      <div className="text-sm font-bold">
                        {Number(menu.price).toLocaleString()}원
                      </div>
                    )}
                  </div>
                  {menu.images.length > 0 ? (
                    <ImagePreviewDialog src={menu.images[0]} alt={menu.name}>
                      <img
                        src={menu.images[0]}
                        alt={menu.name}
                        className="size-20 shrink-0 rounded-lg object-cover"
                      />
                    </ImagePreviewDialog>
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
            naverPlaceId={naverPlaceId}
            reviews={reviews}
            currentUserId={currentUserId}
          />
        ) : (
          <Empty className="border-none py-12">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-none bg-transparent"
              >
                <MessageSquarePlus className="size-12 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">
                리뷰를 작성하면 장소가 등록됩니다
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </TabsContent>
    </Tabs>
  );
}
