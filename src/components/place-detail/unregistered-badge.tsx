import { Badge } from "@/components/ui/badge";

export function UnregisteredBadge() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">미등록 장소</Badge>
      <div className="relative whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg">
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
        장소를 등록해 보세요
      </div>
    </div>
  );
}
