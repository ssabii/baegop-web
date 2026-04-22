"use client";

import { Info } from "lucide-react";
import { DrawerBody } from "@/components/drawer-body";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface InfoDrawerProps {
  title: string;
  description?: string;
  trigger?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  children?: React.ReactNode;
}

export function InfoDrawer({
  title,
  description,
  trigger,
  children,
}: InfoDrawerProps) {
  const { className, ...restTriggerProps } = trigger ?? {};

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label={`${title} 안내`}
          {...restTriggerProps}
          className={cn(
            "text-muted-foreground/60 cursor-pointer focus-visible:outline-none",
            className,
          )}
        >
          <Info className="size-3.5" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerBody>
          <DrawerHeader>
            <DrawerTitle className="text-left">{title}</DrawerTitle>
            {description && (
              <DrawerDescription className="text-left">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          {children}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
