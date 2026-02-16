import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyPlace() {
  return (
    <div className="flex flex-col items-center text-center">
      <MapPinOff className="size-16 text-muted-foreground/30" />
      <p className="mt-4 text-lg font-semibold">등록된 장소가 없어요.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        장소 검색 후 장소를 등록해보세요.
      </p>
      <Button asChild className="mt-6">
        <Link href="/search">장소 검색하기</Link>
      </Button>
    </div>
  );
}
