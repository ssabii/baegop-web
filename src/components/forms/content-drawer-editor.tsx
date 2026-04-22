"use client";

import { useState } from "react";
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
  return (
    <Drawer repositionInputs={false} open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl p-4">
          <DrawerTitle className="sr-only">{srTitle}</DrawerTitle>
          <EditorBody
            // 열릴 때마다 재마운트해 initialValue로 초기화
            key={open ? "open" : "closed"}
            initialValue={initialValue}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            onConfirm={(v) => {
              onConfirm(v);
              onOpenChange(false);
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function EditorBody({
  initialValue,
  placeholder,
  maxLength,
  rows,
  onConfirm,
}: {
  initialValue: string;
  placeholder: string;
  maxLength: number;
  rows: number;
  onConfirm: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <>
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
        onClick={() => onConfirm(value)}
      >
        확인
      </Button>
    </>
  );
}
