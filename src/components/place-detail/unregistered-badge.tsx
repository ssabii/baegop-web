import { Badge } from "@/components/ui/badge";

export function UnregisteredBadge() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">미등록 장소</Badge>
      <div className="bg-foreground text-background relative rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg">
        <div className="border-r-foreground absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent" />
        장소를 등록해 보세요
      </div>
    </div>
  );
}
