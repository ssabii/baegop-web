import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function DeleteAccountCompletePage() {
  return (
    <div className="flex h-dvh items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-full bg-primary/10"
          >
            <CircleCheck className="size-6 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">
            회원탈퇴가 완료되었어요.
          </EmptyTitle>
          <EmptyDescription>
            그동안 배곱을 이용해주셔서 감사합니다.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button asChild size="lg">
            <Link href="/">홈으로 이동</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
