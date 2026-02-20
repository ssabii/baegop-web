"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { deleteAccount } from "./actions";
import { toast } from "sonner";

export function DeleteAccountButton() {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = await confirm({
      title: "정말 탈퇴하시겠습니까?",
      description:
        "탈퇴하면 계정 정보가 삭제되며, 작성하신 리뷰와 등록한 장소는 모두 삭제되지 않습니다.",
      confirmLabel: "탈퇴하기",
      cancelLabel: "취소",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteAccount();
      toast.success("회원탈퇴가 완료되었습니다.", {
        position: "top-center",
      });
      router.push("/signin");
    } catch (e) {
      setIsLoading(false);
      toast.error("회원탈퇴에 실패했습니다. 다시 시도해주세요.", {
        position: "top-center",
      });
    }
  };

  return (
    <Button className="w-full" disabled={isLoading} onClick={handleClick}>
      {isLoading && <Spinner data-icon="inline-start" />}
      회원탈퇴
    </Button>
  );
}
