"use client";

import { useState } from "react";
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
} from "@/components/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface RandomFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryFilter[];
  konaOnly: boolean;
  onApply: (categories: CategoryFilter[], konaOnly: boolean) => void;
}

export function RandomFilter({
  open,
  onOpenChange,
  categories,
  konaOnly,
  onApply,
}: RandomFilterProps) {
  const [tempCategories, setTempCategories] =
    useState<CategoryFilter[]>(categories);
  const [tempKonaOnly, setTempKonaOnly] = useState(konaOnly);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setTempCategories(categories);
      setTempKonaOnly(konaOnly);
    }
    onOpenChange(nextOpen);
  }

  function handleReset() {
    setTempCategories([]);
    setTempKonaOnly(false);
  }

  function handleApply() {
    onApply(tempCategories, tempKonaOnly);
    onOpenChange(false);
  }

  return (
    <>
      <div
        className="absolute inset-x-0 top-0 z-10 h-[38px] bg-background pb-3"
        onClick={() => onOpenChange(true)}
      >
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-none">
          {categories.length === 0 && !konaOnly ? (
            <Badge variant="secondary" className="shrink-0">
              전체
            </Badge>
          ) : (
            <>
              {categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="shrink-0">
                  {cat}
                </Badge>
              ))}
              {konaOnly && (
                <Badge className="shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  <img
                    src="/icons/kona.png"
                    alt="코나카드"
                    className="size-3 rounded-full"
                  />
                  결제가능
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <div className="max-w-4xl mx-auto w-full">
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-left">필터</DrawerTitle>
            </DrawerHeader>

            <div className="space-y-4 px-4 pb-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-accent-foreground">
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
                    <ToggleGroupItem
                      key={cat}
                      value={cat}
                      className="rounded-full"
                    >
                      {cat}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-accent-foreground">
                  결제
                </p>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  spacing={2}
                  className="flex-wrap"
                  value={tempKonaOnly ? ["kona"] : []}
                  onValueChange={(value) =>
                    setTempKonaOnly(value.includes("kona"))
                  }
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
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
