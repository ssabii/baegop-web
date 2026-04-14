import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { COMPANY_LOCATION } from "@/lib/constants";
import { buildNaverWalkingRouteLink } from "@/lib/naver";
import type { NaverWalkingRoute } from "@/lib/naver";
import type { LucideIcon } from "lucide-react";
import { MapPin, Phone, Route } from "lucide-react";

interface ShortcutItem {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
}

function ShortcutButton({ href, icon: Icon, label, external }: ShortcutItem) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="h-auto flex-1 flex-col gap-1 rounded-xl px-0 py-3 has-[>svg]:px-0 min-[375px]:flex-row min-[375px]:gap-1.5"
      asChild
    >
      <a
        href={href}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        <Icon className="size-5" />
        <span className="text-muted-foreground text-xs">{label}</span>
      </a>
    </Button>
  );
}

interface PlaceShortcutsProps {
  naverPlaceId: string;
  detail: {
    x: string;
    y: string;
    name: string;
    phone: string | null;
  };
  walkingRoute: NaverWalkingRoute | null;
}

export function PlaceShortcuts({
  naverPlaceId,
  detail,
  walkingRoute,
}: PlaceShortcutsProps) {
  const items: ShortcutItem[] = [
    {
      href: `https://map.naver.com/p/entry/place/${naverPlaceId}`,
      icon: MapPin,
      label: "지도보기",
      external: true,
    },
    ...(walkingRoute
      ? [
          {
            href: buildNaverWalkingRouteLink(COMPANY_LOCATION, {
              lng: Number(detail.x),
              lat: Number(detail.y),
              name: detail.name,
              placeId: naverPlaceId,
            }),
            icon: Route,
            label: "경로보기",
            external: true,
          },
        ]
      : []),
    ...(detail.phone
      ? [
          {
            href: `tel:${detail.phone}`,
            icon: Phone,
            label: "전화걸기",
          },
        ]
      : []),
  ];

  return (
    <section>
      <ButtonGroup className="w-full rounded-xl">
        {items.map((item) => (
          <ShortcutButton key={item.label} {...item} />
        ))}
      </ButtonGroup>
    </section>
  );
}
