import { PlaceCardSkeleton } from "@/components/places/place-card-skeleton";

export function PlaceListSkeleton() {
  return (
    <div className="flex flex-col divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <PlaceCardSkeleton key={i} />
      ))}
    </div>
  );
}
