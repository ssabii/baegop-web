import { PackageOpen } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyPlace() {
  return (
    <Empty className="border-none">
      <EmptyHeader className="gap-1">
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-none bg-transparent"
        >
          <PackageOpen className="size-12 text-primary" />
        </EmptyMedia>
        <EmptyTitle className="font-bold">등록된 장소가 없어요</EmptyTitle>
        <EmptyDescription>
          장소 검색 후 장소를 등록해보세요
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
