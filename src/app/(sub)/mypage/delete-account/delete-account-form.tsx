"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { DeleteAccountButton } from "./delete-account-button";

export function DeleteAccountForm() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 px-4 py-8">
        <h2 className="text-base font-bold">탈퇴 시 유의사항</h2>
        <ul className="ml-4 mt-3 flex flex-col gap-2 text-sm text-secondary-foreground list-disc list-outside">
          <li>탈퇴 즉시 계정 정보가 삭제되며, 복구할 수 없습니다.</li>
          <li>작성하신 리뷰와 등록한 장소는 모두 삭제되지 않습니다.</li>
          <li>
            같은 이메일로 다시 가입할 수 있지만, 이전 데이터는 복원되지
            않습니다.
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-2">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <Label htmlFor="agree" className="text-sm font-medium">
            안내 사항을 모두 확인하였으며, 회원탈퇴에 동의합니다.
          </Label>
        </div>
      </div>
      <BottomActionBar>
        <DeleteAccountButton disabled={!agreed} />
      </BottomActionBar>
    </div>
  );
}
