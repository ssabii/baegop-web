"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { DeleteAccountButton } from "./delete-account-button";

export function DeleteAccountForm() {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <h2 className="text-base font-bold">탈퇴 시 유의사항</h2>
        <ul className="ml-4 mt-3 flex flex-col gap-2 text-sm text-secondary-foreground list-disc list-outside">
          <li>
            계정 정보(이메일, 프로필)는 즉시 삭제되며, 복구할 수 없습니다.
          </li>
          <li>
            작성하신 리뷰는 &ldquo;탈퇴한 사용자&rdquo;로 익명화되어 서비스에
            유지됩니다.
          </li>
          <li>
            같은 이메일로 다시 가입할 수 있지만, 이전 데이터와 연결되지
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
        <div className="mx-auto flex max-w-4xl">
          <DeleteAccountButton disabled={!agreed} />
        </div>
      </BottomActionBar>
    </>
  );
}
