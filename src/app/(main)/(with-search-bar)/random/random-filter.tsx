"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  CATEGORY_FILTERS,
  DEFAULT_CATEGORY_FILTERS,
  type CategoryFilter,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
}

export function RandomFilter({
  categories,
  konaOnly,
  onApply,
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
    setTempCategories([...DEFAULT_CATEGORY_FILTERS]);
    setTempKonaOnly(false);
  }

  function handleApply() {
    onApply(tempCategories, tempKonaOnly);
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <div className="flex items-center gap-2 py-3">
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5">
            {categories.map((cat) => (
              <DrawerTrigger key={cat} asChild>
                <Badge
                  variant="secondary"
                  className="shrink-0 cursor-pointer"
                >
                  {cat}
                </Badge>
              </DrawerTrigger>
            ))}
            {konaOnly && (
              <DrawerTrigger asChild>
                <Badge
                  className="shrink-0 cursor-pointer bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  <img
                    src="/icons/kona.png"
                    alt="코나카드"
                    className="size-3 rounded-full"
                  />
                  결제가능
                </Badge>
              </DrawerTrigger>
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
          <div className="flex items-center justify-between">
            <DrawerTitle>카테고리 필터</DrawerTitle>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={tempKonaOnly}
                onCheckedChange={(checked) =>
                  setTempKonaOnly(checked === true)
                }
              />
              <span className="text-sm font-medium">코나카드 가능</span>
            </label>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4">
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

        <DrawerFooter className="flex-row">
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            onClick={handleReset}
          >
            초기화
          </Button>
          <Button size="xl" className="flex-[3]" onClick={handleApply}>
            적용
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
