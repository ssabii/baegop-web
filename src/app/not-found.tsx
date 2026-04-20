import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <main className="flex h-dvh flex-col">
      <Empty className="flex-1 border-none">
        <EmptyHeader className="gap-1">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-none bg-transparent"
          >
            <SearchX className="size-12 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">
            페이지를 찾을 수 없어요
          </EmptyTitle>
          <EmptyDescription>
            주소가 올바른지 확인해주세요
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="xl" asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
