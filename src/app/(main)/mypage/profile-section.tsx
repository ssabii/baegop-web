"use client";

import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useProfile } from "@/hooks/use-profile";

export function ProfileSection() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <ItemGroup className="bg-background rounded-xl">
        <Item className="gap-2">
          <ItemMedia
            variant="icon"
            className="size-14 shrink-0 border-none bg-transparent"
          >
            <Skeleton className="size-14 rounded-full" />
          </ItemMedia>
          <ItemContent className="flex-1 gap-1">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-40" />
          </ItemContent>
        </Item>
      </ItemGroup>
    );
  }

  if (!profile) return null;

  return (
    <ItemGroup className="bg-background rounded-xl">
      <Item asChild className="gap-2">
        <Link href="/mypage/profile">
          <ItemMedia
            variant="icon"
            className="size-14 shrink-0 border-none bg-transparent"
          >
            <Avatar className="size-14">
              <AvatarImage
                className="object-cover"
                src={
                  profile.avatarUrl
                    ? optimizeSupabaseImageUrl(profile.avatarUrl)
                    : undefined
                }
              />
              <AvatarFallback>
                <UserRound className="text-muted-foreground size-12" />
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent className="flex-1 gap-0">
            <ItemTitle className="line-clamp-1 text-xl font-bold">
              {profile.nickname}
            </ItemTitle>
            <ItemDescription className="line-clamp-1 text-base">
              {profile.email}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="shrink-0">
            <ChevronRight className="size-5" />
          </ItemActions>
        </Link>
      </Item>
    </ItemGroup>
  );
}
