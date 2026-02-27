import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { COMPANY_LOCATION } from "@/lib/constants";
import { buildNaverPlaceLink, buildNaverWalkingRouteLink } from "@/lib/naver";
import type { NaverWalkingRoute } from "@/lib/naver";
import { ExternalLink, Map, Phone, Route } from "lucide-react";

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
  const naverLink = buildNaverPlaceLink(naverPlaceId);

  return (
    <section>
      <ButtonGroup className="w-full">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 flex-col gap-1 h-auto px-0 has-[>svg]:px-0 py-3"
          asChild
        >
          <a href={naverLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-5" />
            <span className="text-xs text-muted-foreground">장소보기</span>
          </a>
        </Button>
        <ButtonGroupSeparator />
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 flex-col gap-1 h-auto px-0 has-[>svg]:px-0 py-3"
          asChild
        >
          <a
            href={`https://map.naver.com/p/entry/place/${naverPlaceId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Map className="size-5" />
            <span className="text-xs text-muted-foreground sm:inline">
              지도보기
            </span>
          </a>
        </Button>
        {walkingRoute && (
          <>
            <ButtonGroupSeparator />
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 flex-col gap-1 h-auto px-0 has-[>svg]:px-0 py-3"
              asChild
            >
              <a
                href={buildNaverWalkingRouteLink(COMPANY_LOCATION, {
                  lng: Number(detail.x),
                  lat: Number(detail.y),
                  name: detail.name,
                  placeId: naverPlaceId,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Route className="size-5" />
                <span className="text-xs text-muted-foreground">경로보기</span>
              </a>
            </Button>
          </>
        )}
        {detail.phone && (
          <>
            <ButtonGroupSeparator />
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 flex-col gap-1 h-auto px-0 has-[>svg]:px-0 py-3"
              asChild
            >
              <a href={`tel:${detail.phone}`}>
                <Phone className="size-5" />
                <span className="text-xs text-muted-foreground">전화걸기</span>
              </a>
            </Button>
          </>
        )}
      </ButtonGroup>
    </section>
  );
}
