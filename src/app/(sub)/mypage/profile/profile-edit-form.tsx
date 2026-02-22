"use client";

import { BottomActionBar } from "@/components/bottom-action-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { Camera, UserRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { profileQueryKey, useProfile } from "@/hooks/use-profile";
import { updateNickname, uploadAvatar } from "./actions";

const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]+(?:\s[가-힣a-zA-Z0-9]+)*$/;

interface ProfileEditFormProps {
  userId: string;
}

export function ProfileEditForm({ userId }: ProfileEditFormProps) {
  const { profile } = useProfile(userId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState(profile.nickname);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerNickname, setDrawerNickname] = useState(profile.nickname);
  const [nicknameError, setNicknameError] = useState("");

  const isDirty = avatarFile !== null || nickname !== profile.nickname;

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDrawerOpen = () => {
    setDrawerNickname(nickname);
    setNicknameError("");
    setDrawerOpen(true);
  };

  const handleDrawerConfirm = () => {
    const trimmed = drawerNickname.trim();

    if (!trimmed) {
      setNicknameError("닉네임을 입력해주세요");
      return;
    }

    if (trimmed.length < 2) {
      setNicknameError("2자 이상 입력해주세요");
      return;
    }

    if (trimmed.length > 12) {
      setNicknameError("12자 이하로 입력해주세요");
      return;
    }

    if (!NICKNAME_REGEX.test(trimmed)) {
      setNicknameError("한글, 영문, 숫자만 입력할 수 있어요");
      return;
    }

    setNickname(trimmed);
    setDrawerOpen(false);
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await uploadAvatar(formData);
      }

      if (nickname !== profile.nickname) {
        await updateNickname(nickname);
      }

      queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
      toast.success("프로필이 수정되었습니다", { position: "top-center" });
      router.back();
    } catch {
      toast.error("프로필 수정에 실패했습니다. 다시 시도해주세요.", {
        position: "top-center",
      });
      setIsPending(false);
    }
  };

  return (
    <>
      {/* 아바타 섹션 */}
      <div className="flex justify-center px-4 pt-8 pb-6">
        <button
          type="button"
          className="relative cursor-pointer"
          onClick={handleAvatarClick}
        >
          <Avatar className="size-24">
            <AvatarImage
              src={
                avatarPreview ??
                (profile.avatarUrl
                  ? optimizeSupabaseImageUrl(profile.avatarUrl)
                  : undefined)
              }
              className="object-cover"
            />
            <AvatarFallback className="text-3xl">
              <UserRound className="size-20 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full bg-background border">
            <Camera className="size-4 text-foreground" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 닉네임 섹션 */}
      <div className="flex flex-col gap-2 px-4">
        <label className="text-sm font-bold">닉네임</label>
        <Input
          readOnly
          value={nickname}
          placeholder="닉네임을 입력해주세요"
          onClick={handleDrawerOpen}
          className="h-12 cursor-pointer dark:bg-transparent"
        />
      </div>

      {/* 닉네임 변경 Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="sr-only">닉네임 변경</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <Input
              autoFocus
              value={drawerNickname}
              placeholder="닉네임을 입력해주세요"
              onChange={(e) => {
                setDrawerNickname(e.target.value);
                setNicknameError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDrawerConfirm();
              }}
              maxLength={12}
              className="h-12 dark:bg-transparent"
            />
            {nicknameError && (
              <p className="mt-2 text-sm text-destructive">{nicknameError}</p>
            )}
          </div>
          <DrawerFooter>
            <Button size="xl" onClick={handleDrawerConfirm}>
              확인
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 저장 버튼 */}
      <BottomActionBar>
        <Button
          className="w-full"
          size="xl"
          disabled={!isDirty || isPending}
          onClick={handleSave}
        >
          {isPending && <Spinner data-icon="inline-start" />}
          수정
        </Button>
      </BottomActionBar>
    </>
  );
}
