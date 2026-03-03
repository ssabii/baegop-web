"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { DubaiCookieStore } from "@/data/dubai-cookie-stores";

interface StoreDrawerProps {
  store: DubaiCookieStore | null;
  onClose: () => void;
}

export function StoreDrawer({ store, onClose }: StoreDrawerProps) {
  return (
    <Drawer open={!!store} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{store?.name}</DrawerTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{store?.address}</span>
          </div>
        </DrawerHeader>
        <DrawerFooter>
          {store && (
            <Button size="xl" asChild>
              <Link href={`/places/${store.placeId}`}>자세히 보기</Link>
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
