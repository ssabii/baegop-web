"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORY_FILTERS, type CategoryFilter } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface RandomFilterProps {
  categories: CategoryFilter[];
  konaOnly: boolean;
  onApply: (categories: CategoryFilter[], konaOnly: boolean) => void;
  onRemoveCategory: (category: CategoryFilter) => void;
  onRemoveKona: () => void;
}

export function RandomFilter({
  categories,
  konaOnly,
  onApply,
  onRemoveCategory,
  onRemoveKona,
}: RandomFilterProps) {
  const [open, setOpen] = useState(false);
  const [tempCategories, setTempCategories] =
    useState<CategoryFilter[]>(categories);
  const [tempKonaOnly, setTempKonaOnly] = useState(konaOnly);

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) {
      setTempCategories(categories);
      setTempKonaOnly(konaOnly);
    }
    setOpen(nextOpen);
  }

  function handleReset() {
    setTempCategories([]);
    setTempKonaOnly(false);
  }

  function handleApply() {
    onApply(tempCategories, tempKonaOnly);
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <div className="flex items-center gap-2 px-4">
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="shrink-0 cursor-pointer gap-0.5"
                onClick={() => onRemoveCategory(cat)}
              >
                {cat}
                <X className="size-3" />
              </Badge>
            ))}
            {konaOnly && (
              <Badge
                className="shrink-0 cursor-pointer gap-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                onClick={onRemoveKona}
              >
                <img
                  src="/icons/kona.png"
                  alt="코나카드"
                  className="size-3 rounded-full"
                />
                결제가능
                <X className="size-3" />
              </Badge>
            )}
          </div>
        </div>

        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <SlidersHorizontal className="size-5" />
          </Button>
        </DrawerTrigger>
      </div>

      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>필터</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              카테고리
            </p>
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              className="flex-wrap"
              value={tempCategories}
              onValueChange={(value) =>
                setTempCategories(value as CategoryFilter[])
              }
            >
              {CATEGORY_FILTERS.map((cat) => (
                <ToggleGroupItem key={cat} value={cat} className="rounded-full">
                  {cat}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">결제</p>
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              className="flex-wrap"
              value={tempKonaOnly ? ["kona"] : []}
              onValueChange={(value) => setTempKonaOnly(value.includes("kona"))}
            >
              <ToggleGroupItem value="kona" className="rounded-full">
                코나카드 가능
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <DrawerFooter className="flex-row">
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            onClick={handleReset}
          >
            초기화
          </Button>
          <Button size="xl" className="flex-3" onClick={handleApply}>
            적용
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
