"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";

export function SearchBarAvatar() {
  const { profile, isLoading } = useProfile();

  if (isLoading) return <Skeleton className="size-7 rounded-full" />;
  if (!profile) return null;

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
