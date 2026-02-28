"use client";

import { useInView } from "react-intersection-observer";
import { UtensilsCrossed } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { optimizeNaverImageUrl } from "@/lib/image";
import { useMenus, type MenusResponse } from "./use-menus";

interface MenuSectionProps {
  naverPlaceId: string;
  initialData?: MenusResponse;
}

export function MenuSection({ naverPlaceId, initialData }: MenuSectionProps) {
  const { menus, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMenus(naverPlaceId, initialData);

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

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
        {menus.map((menu) => (
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
              <ImagePreviewDialog src={optimizeNaverImageUrl(menu.images[0])} alt={menu.name}>
                <img
                  src={optimizeNaverImageUrl(menu.images[0])}
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
      <div ref={sentinelRef} className="flex items-center justify-center">
        {isFetchingNextPage && <Spinner className="size-6 text-primary" />}
      </div>
    </div>
  );
}
