"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { useProfile } from "@/hooks/use-profile";

export function SearchBarAvatar() {
  const { profile, isLoading } = useProfile();

  if (isLoading) return <Skeleton className="size-7 rounded-full" />;
  if (!profile) return null;

  return (
    <Link href="/mypage">
      <Avatar size="sm">
        {profile.avatarUrl && (
          <AvatarImage src={optimizeSupabaseImageUrl(profile.avatarUrl)} alt={profile.nickname} />
        )}
        <AvatarFallback>
          <User className="size-3.5" />
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
