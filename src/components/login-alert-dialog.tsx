"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LoginAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  /** 로그인 후 이동할 경로. 미지정 시 현재 페이지로 복귀 */
  redirect?: string;
}

export function LoginAlertDialog({
  open,
  onOpenChange,
  description,
  redirect,
}: LoginAlertDialogProps) {
  const pathname = usePathname();
  const redirectPath = redirect ?? pathname;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>로그인이 필요해요</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href={`/signin?redirect=${encodeURIComponent(redirectPath)}`}>
              로그인
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
