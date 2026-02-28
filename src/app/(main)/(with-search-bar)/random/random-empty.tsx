import { CircleQuestionMarkIcon, SearchX } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export function RandomEmptyNoResults() {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <Empty className="border-none py-12">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <SearchX className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">
            조건에 맞는 장소가 없어요
          </EmptyTitle>
          <EmptyDescription>필터를 변경해 보세요</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

export function RandomEmptyInitial() {
  return (
    <div className="flex h-full items-center justify-center">
      <Empty className="border-none py-12">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <CircleQuestionMarkIcon className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">오늘 뭐 먹지?</EmptyTitle>
          <EmptyDescription>
            랜덤 버튼을 누르면 장소를 추천해 드려요!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
