"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
        <div className="mx-auto w-full max-w-4xl p-4">
          <DrawerHeader>
            <DrawerTitle className="text-left">{title}</DrawerTitle>
            {description && (
              <DrawerDescription className="text-left">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
