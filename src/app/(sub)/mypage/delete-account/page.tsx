import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { DeleteAccountButton } from "./delete-account-button";

export default async function DeleteAccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <>
      <SubHeader title="회원탈퇴" />
      <div className="flex flex-1 flex-col">
        <div className="flex-1 px-4 py-8">
          <h2 className="text-base font-bold">탈퇴 시 유의사항</h2>
          <ul className="ml-4 mt-3 flex flex-col gap-2 text-sm text-muted-foreground list-disc list-outside">
            <li>탈퇴 즉시 계정 정보가 삭제되며, 복구할 수 없습니다.</li>
            <li>작성하신 리뷰와 등록한 장소는 모두 삭제되지 않습니다.</li>
            <li>
              같은 이메일로 다시 가입할 수 있지만, 이전 데이터는 복원되지
              않습니다.
            </li>
          </ul>
        </div>
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background px-4 py-3">
          <DeleteAccountButton />
        </div>
      </div>
    </>
  );
}
