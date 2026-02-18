"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className="rounded-full" disabled>
        <span className="sr-only">테마 전환</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-full"
      onClick={() => {
        const next = resolvedTheme === "dark" ? "light" : "dark";
        if (document.startViewTransition) {
          document.startViewTransition(() => setTheme(next));
        } else {
          setTheme(next);
        }
      }}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
      <span className="sr-only">테마 전환</span>
    </Button>
  );
}
