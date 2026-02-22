"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { deleteAccount } from "./actions";
import { toast } from "sonner";

interface DeleteAccountButtonProps {
  disabled?: boolean;
}

export function DeleteAccountButton({ disabled }: DeleteAccountButtonProps) {
  const router = useRouter();
  const confirm = useConfirmDialog();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = await confirm({
      title: "정말 탈퇴하시겠습니까?",
      description:
        "계정 정보는 삭제되며\n작성하신 리뷰는 익명화되어 유지됩니다.",
      confirmLabel: "탈퇴하기",
      cancelLabel: "취소",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteAccount();
      router.replace("/mypage/delete-account/complete");
    } catch {
      setIsLoading(false);
      toast.error("회원탈퇴에 실패했습니다. 다시 시도해주세요.", {
        position: "top-center",
      });
    }
  };

  return (
    <Button className="w-full" size="xl" disabled={disabled || isLoading} onClick={handleClick}>
      {isLoading && <Spinner data-icon="inline-start" />}
      회원탈퇴
    </Button>
  );
}
