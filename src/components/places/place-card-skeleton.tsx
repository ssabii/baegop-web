import { Skeleton } from "@/components/ui/skeleton";

export function PlaceCardSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="size-28 shrink-0 rounded-lg" />
    </div>
  );
}
