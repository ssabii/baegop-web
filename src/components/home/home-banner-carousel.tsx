"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { RankingBanner } from "./ranking-banner";
import { DubaiCookieBanner } from "./dubai-cookie-banner";
import Autoplay from "embla-carousel-autoplay";

const BANNERS = [
  { key: "ranking", component: RankingBanner },
  { key: "dubai-cookie", component: DubaiCookieBanner },
];

export function HomeBannerCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="flex flex-col gap-2">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        plugins={[Autoplay({ delay: 5000 })]}
        orientation="vertical"
      >
        <CarouselContent className="h-22">
          {BANNERS.map(({ key, component: Banner }) => (
            <CarouselItem key={key}>
              <Banner />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex justify-center gap-1.5">
        {BANNERS.map(({ key }, index) => (
          <button
            key={key}
            type="button"
            className={cn("size-1.5 rounded-full transition-colors", {
              "bg-foreground": current === index,
              "bg-foreground/20": current !== index,
            })}
            onClick={() => api?.scrollTo(index)}
            aria-label={`배너 ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
