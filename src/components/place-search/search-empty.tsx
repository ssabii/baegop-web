import { Search } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function SearchEmpty() {
  return (
    <Empty className="border-none">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-32">
          <Search className="size-16 text-primary bg-none" />
        </EmptyMedia>
        <EmptyTitle className="font-bold">장소를 검색해보세요.</EmptyTitle>
        <EmptyDescription>
          상호명, 지역명, 음식으로 검색할 수 있어요.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
