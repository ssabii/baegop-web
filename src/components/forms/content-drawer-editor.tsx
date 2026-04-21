"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";

interface ContentDrawerEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  srTitle: string;
  initialValue: string;
  onConfirm: (value: string) => void;
  placeholder: string;
  maxLength: number;
  rows?: number;
}

export function ContentDrawerEditor({
  open,
  onOpenChange,
  srTitle,
  initialValue,
  onConfirm,
  placeholder,
  maxLength,
  rows = 5,
}: ContentDrawerEditorProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  return (
    <Drawer
      repositionInputs={false}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl p-4">
          <DrawerTitle className="sr-only">{srTitle}</DrawerTitle>
          <Textarea
            autoFocus
            className="field-sizing-fixed resize-none"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
            onFocus={(e) => {
              const el = e.currentTarget;
              el.setSelectionRange(el.value.length, el.value.length);
            }}
            maxLength={maxLength}
            rows={rows}
          />
          <p className="text-muted-foreground mt-2 text-right text-sm">
            {value.length}/{maxLength}
          </p>
          <Button
            className="mt-4 w-full"
            size="xl"
            onClick={() => {
              onConfirm(value);
              onOpenChange(false);
            }}
          >
            확인
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
