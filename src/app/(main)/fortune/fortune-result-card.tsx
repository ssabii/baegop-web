"use client";

import { motion } from "framer-motion";
import { Info, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FortuneActionButton } from "./fortune-action-button";
import { RestaurantThumbnail } from "./restaurant-thumbnail";
import type { MockRestaurant } from "./fortune-data";

interface FortuneResultCardProps {
  restaurant: MockRestaurant;
  rerollsLeft: number;
  onAccept: () => void;
  onReroll: () => void;
}

export function FortuneResultCard({
  restaurant,
  rerollsLeft,
  onAccept,
  onReroll,
}: FortuneResultCardProps) {
  const canReroll = rerollsLeft > 0;

  return (
    <motion.div
      className="flex w-full flex-col items-center gap-5 px-4 pt-6 pb-23"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Headline restaurant={restaurant} />
      <RestaurantThumbnail
        imageUrl={restaurant.imageUrl}
        name={restaurant.name}
        rounded
      />
      <InfoRow restaurant={restaurant} />
      <FortuneMessage message={restaurant.fortuneMessage} />

      <div className="flex w-full flex-col gap-3">
        <FortuneActionButton variant="primary" onClick={onAccept}>
          운명을 받아들인다
        </FortuneActionButton>
        <FortuneActionButton
          variant="secondary"
          disabled={!canReroll}
          onClick={onReroll}
        >
          운명에 저항한다{" "}
          <span className="text-sm font-normal">
            (남은기회 {rerollsLeft}번)
          </span>
        </FortuneActionButton>
      </div>
    </motion.div>
  );
}

function Headline({ restaurant }: { restaurant: MockRestaurant }) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold">{restaurant.fullName}</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {restaurant.category} &middot; {restaurant.distanceText}
      </p>
    </div>
  );
}

function InfoRow({ restaurant }: { restaurant: MockRestaurant }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-bold">
            {restaurant.fullName}
          </span>
          <OpenStatusBadge isOpen={restaurant.isOpen} />
        </div>
        <RatingBadge
          rating={restaurant.rating}
          reviewCount={restaurant.reviewCount}
        />
      </div>
      <p className="text-muted-foreground mt-0.5 text-xs">
        {restaurant.description}
      </p>
    </div>
  );
}

function OpenStatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Info className="text-muted-foreground size-3.5" />
      <span
        className={cn("text-xs font-medium", {
          "text-green-600": isOpen,
          "text-muted-foreground": !isOpen,
        })}
      >
        {isOpen ? "영업중" : "영업전"}
      </span>
    </div>
  );
}

function RatingBadge({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Star className="size-4 fill-yellow-500 text-yellow-500" />
      <span className="text-sm font-bold">{rating}</span>
      <span className="text-muted-foreground text-xs">({reviewCount})</span>
    </div>
  );
}

function FortuneMessage({ message }: { message: string }) {
  return (
    <div className="w-full rounded-xl border bg-card p-4 text-center">
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}
