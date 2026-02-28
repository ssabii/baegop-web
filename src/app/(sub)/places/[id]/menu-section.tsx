"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { UtensilsCrossed } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { NaverPlaceMenu } from "@/types";

const MENU_PAGE_SIZE = 10;

interface MenuSectionProps {
  menus: NaverPlaceMenu[];
}

export function MenuSection({ menus }: MenuSectionProps) {
  const [visibleCount, setVisibleCount] = useState(MENU_PAGE_SIZE);
  const visibleMenus = menus.slice(0, visibleCount);
  const hasMore = menus.length > visibleCount;

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) {
        setVisibleCount((prev) => prev + MENU_PAGE_SIZE);
      }
    },
  });

  if (menus.length === 0) {
    return (
      <Empty className="h-[40vh]">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <UtensilsCrossed className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">등록된 메뉴가 없어요</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-h-[40vh]">
      <ul className="divide-y">
        {visibleMenus.map((menu) => (
          <li
            key={menu.name}
            className="flex items-start gap-2 py-4 first:pt-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {menu.recommend && (
                <div>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                    대표
                  </span>
                </div>
              )}
              <div className="truncate text-sm font-bold">{menu.name}</div>
              {menu.description && (
                <div className="line-clamp-2 text-sm text-muted-foreground">
                  {menu.description}
                </div>
              )}
              {menu.price && (
                <div className="text-sm font-bold text-accent-foreground">
                  {Number(menu.price).toLocaleString()}원
                </div>
              )}
            </div>
            {menu.images.length > 0 ? (
              <ImagePreviewDialog src={menu.images[0]} alt={menu.name}>
                <img
                  src={menu.images[0]}
                  alt={menu.name}
                  className="size-22 shrink-0 rounded-lg object-cover"
                />
              </ImagePreviewDialog>
            ) : (
              <div className="flex size-22 shrink-0 items-center justify-center rounded-lg bg-muted">
                <UtensilsCrossed className="size-5 text-muted-foreground" />
              </div>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </div>
      )}
    </div>
  );
}
