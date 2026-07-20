"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ListErrorStateProps {
  onRetry: () => void;
  title?: string;
  description?: string;
}

/**
 * 리스트 데이터 로딩 실패 시 표시하는 공용 에러 상태. "다시 시도"로 refetch를 유도한다.
 * 레이아웃(정렬/여백)은 사용하는 쪽에서 결정한다.
 */
export function ListErrorState({
  onRetry,
  title = "불러오지 못했어요",
  description = "잠시 후 다시 시도해주세요",
}: ListErrorStateProps) {
  return (
    <Empty className="border-none">
      <EmptyHeader className="gap-1">
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-none bg-transparent"
        >
          <AlertCircle className="text-primary size-12" />
        </EmptyMedia>
        <EmptyTitle className="font-bold">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="xl" onClick={onRetry}>
          다시 시도
        </Button>
      </EmptyContent>
    </Empty>
  );
}
