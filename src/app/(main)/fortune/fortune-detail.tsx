"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FortuneActionButton } from "./fortune-action-button";
import { RestaurantThumbnail } from "./restaurant-thumbnail";
import type { MockRestaurant } from "./fortune-data";

interface FortuneDetailProps {
  restaurant: MockRestaurant;
  rerollsLeft: number;
  onBack: () => void;
  onRetry: () => void;
}

export function FortuneDetail({
  restaurant,
  rerollsLeft,
  onBack,
  onRetry,
}: FortuneDetailProps) {
  const canRetry = rerollsLeft > 0;

  return (
    <motion.div
      className="flex w-full flex-col pb-23"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Header onBack={onBack} />

      <RestaurantThumbnail
        imageUrl={restaurant.imageUrl}
        name={restaurant.name}
      />

      <div className="flex flex-col gap-6 p-4">
        <Headline restaurant={restaurant} />
        <InfoList restaurant={restaurant} />
        <FortuneMessage message={restaurant.fortuneMessage} />

        <FortuneActionButton
          variant="primary"
          disabled={!canRetry}
          onClick={onRetry}
        >
          다시하기{" "}
          <span className="text-sm font-normal">
            (남은기회 {rerollsLeft}번)
          </span>
        </FortuneActionButton>
      </div>
    </motion.div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center p-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        aria-label="뒤로가기"
      >
        <ArrowLeft className="size-5" />
      </Button>
    </div>
  );
}

function Headline({ restaurant }: { restaurant: MockRestaurant }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{restaurant.fullName}</h1>
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>{restaurant.category}</span>
        <span>·</span>
        <span>{restaurant.distanceText}</span>
      </div>

      <div className="flex items-center gap-2">
        <Star className="size-4 fill-yellow-500 text-yellow-500" />
        <span className="text-sm font-bold">{restaurant.rating}</span>
        <span className="text-muted-foreground text-sm">
          리뷰 {restaurant.reviewCount}개
        </span>
        <OpenStatusBadge isOpen={restaurant.isOpen} />
      </div>

      <p className="text-muted-foreground text-sm">{restaurant.description}</p>
    </div>
  );
}

function OpenStatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={cn("ml-1 text-xs font-medium", {
        "text-green-600": isOpen,
        "text-muted-foreground": !isOpen,
      })}
    >
      {isOpen ? "영업중" : "영업전"}
    </span>
  );
}

function InfoList({ restaurant }: { restaurant: MockRestaurant }) {
  const items = [
    { icon: Clock, label: restaurant.hours },
    { icon: MapPin, label: restaurant.address },
    { icon: Phone, label: restaurant.phone },
  ];

  return (
    <ul className="flex flex-col gap-2 border-t pt-4">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="text-muted-foreground flex items-center gap-3 text-sm"
        >
          <Icon className="size-4 shrink-0" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function FortuneMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
        오늘의 운세
      </p>
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}
