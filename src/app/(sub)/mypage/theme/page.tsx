"use client";

import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { SubHeader } from "@/components/sub-header";
import {
  Item,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

const THEME_OPTIONS = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
] as const;

export default function ThemePage() {
  const { theme, setTheme } = useTheme();

  const handleSetTheme = (value: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(value));
    } else {
      setTheme(value);
    }
  };

  return (
    <div className="h-screen">
      <SubHeader title="테마" />
      <div className="px-4 pt-8">
        <ItemGroup className="rounded-xl bg-card">
          {THEME_OPTIONS.map(({ value, label }) => (
            <Item
              key={value}
              className="cursor-pointer"
              onClick={() => handleSetTheme(value)}
            >
              <ItemContent>
                <ItemTitle className="text-sm font-bold">{label}</ItemTitle>
              </ItemContent>
              {theme === value && (
                <ItemActions>
                  <Check className="size-4 text-primary" />
                </ItemActions>
              )}
            </Item>
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}
