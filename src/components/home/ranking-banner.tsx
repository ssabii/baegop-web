"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { LoginAlertDialog } from "@/components/login-alert-dialog";
import { useProfile } from "@/hooks/use-profile";

export function RankingBanner() {
  const { profile } = useProfile();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const isLoggedIn = !!profile;

  if (isLoggedIn) {
    return (
      <Link
        href="/mypage/ranking"
        className="flex items-center justify-between rounded-xl bg-linear-to-r from-[#E8590C] to-[#F59F00] px-4 py-3 text-white transition-opacity active:opacity-80 dark:from-[#C2410C] dark:to-[#D97706]"
      >
        <BannerContent />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl bg-linear-to-r from-[#E8590C] to-[#F59F00] px-4 py-3 text-white transition-opacity active:opacity-80 dark:from-[#C2410C] dark:to-[#D97706]"
        onClick={() => setLoginDialogOpen(true)}
      >
        <BannerContent />
      </button>
      <LoginAlertDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        description="로그인하시면 랭킹을 확인할 수 있어요."
        redirect="/mypage/ranking"
      />
    </>
  );
}

function BannerContent() {
  return (
    <>
      <div className="flex items-center gap-3">
        <Trophy className="size-10" strokeWidth={2} />
        <div className="text-left">
          <p className="text-sm font-medium text-white/80">
            활동으로 포인트를 모아보세요!
          </p>
          <p className="font-bold">랭킹</p>
        </div>
      </div>
      <ChevronRight className="size-6" />
    </>
  );
}
