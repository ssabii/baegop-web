"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, MapPin, Shuffle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "홈", icon: Home, href: "/", match: (p: string) => p === "/" },
  {
    label: "장소",
    icon: List,
    href: "/places",
    match: (p: string) => p.startsWith("/places"),
  },
  {
    label: "랜덤",
    icon: Shuffle,
    href: "/random",
    match: (p: string) => p.startsWith("/random"),
  },
  {
    label: "지도",
    icon: MapPin,
    href: "/map",
    match: (p: string) => p.startsWith("/map"),
  },
  {
    label: "마이",
    icon: User,
    href: "/mypage",
    match: (p: string) => p.startsWith("/mypage"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 shadow-top pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: "var(--background)" }}>
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {tabs.map(({ label, icon: Icon, href, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-bold transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
