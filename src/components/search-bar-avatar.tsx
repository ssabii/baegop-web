"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/use-profile";

interface SearchBarAvatarProps {
  userId: string;
}

export function SearchBarAvatar({ userId }: SearchBarAvatarProps) {
  const { profile } = useProfile(userId);

  const initials = profile.nickname.charAt(0).toUpperCase();

  return (
    <Link href="/mypage">
      <Avatar size="sm">
        {profile.avatarUrl && (
          <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
