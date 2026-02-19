import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function SignUpConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-12 bg-primary/10 rounded-full"
          >
            <Mail className="text-primary size-6" />
          </EmptyMedia>
          <EmptyTitle className="font-bold">이메일을 확인해주세요</EmptyTitle>
          <EmptyDescription>
            인증 메일을 발송했습니다. <br />
            메일이 보이지 않으면 스팸함을 확인해주세요.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button asChild variant="outline">
            <Link href="/signin">로그인 페이지로 이동</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
