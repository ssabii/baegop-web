"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { MessageCircle, UtensilsCrossed } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReviewSection } from "./review-section";
import type { NaverPlaceMenu } from "@/types";

const MENU_PAGE_SIZE = 10;

interface PlaceDetailTabsProps {
  menus: NaverPlaceMenu[];
  isRegistered: boolean;
  placeId: string | null;
  naverPlaceId: string;
  currentUserId: string | null;
}

export function PlaceDetailTabs({
  menus,
  isRegistered,
  placeId,
  naverPlaceId,
  currentUserId,
}: PlaceDetailTabsProps) {
  const [visibleCount, setVisibleCount] = useState(MENU_PAGE_SIZE);
  const visibleMenus = menus.slice(0, visibleCount);
  const hasMore = menus.length > visibleCount;

  const { ref: menuSentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) {
        setVisibleCount((prev) => prev + MENU_PAGE_SIZE);
      }
    },
  });

  return (
    <Tabs defaultValue="review">
      <TabsList className="w-full">
        <TabsTrigger value="review" className="flex-1 cursor-pointer">
          리뷰
        </TabsTrigger>
        <TabsTrigger value="menu" className="flex-1 cursor-pointer">
          메뉴
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
                <UtensilsCrossed className="size-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">
                등록된 메뉴가 없어요
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ul className="divide-y">
              {visibleMenus.map((menu) => (
                <li key={menu.name} className="flex items-start gap-2 py-3">
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="space-y-1">
                      {menu.recommend && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
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
              <div ref={menuSentinelRef} className="flex justify-center py-4">
                <Spinner className="size-6 text-primary" />
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
            currentUserId={currentUserId}
          />
        ) : (
          <Empty className="border-none py-12">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-none bg-transparent"
              >
                <MessageCircle className="size-12 text-muted-foreground" />
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
