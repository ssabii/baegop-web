import { PackageOpen } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function SearchNoResults() {
  return (
    <Empty className="border-none">
      <EmptyHeader className="gap-1">
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-none bg-transparent"
        >
          <PackageOpen className="size-12 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="font-bold">검색 결과가 없어요</EmptyTitle>
        <EmptyDescription>다른 검색어로 검색해보세요</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
