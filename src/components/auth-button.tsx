"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthButtonProps {
  user: User | null;
  profile: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
}

export function AuthButton({ user, profile }: AuthButtonProps) {
  const router = useRouter();

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/signin">로그인</Link>
      </Button>
    );
  }

  const displayName = profile?.nickname || user.email || "사용자";
  const initials = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar size="sm">
            {profile?.avatar_url && (
              <AvatarImage src={optimizeSupabaseImageUrl(profile.avatar_url)} alt={displayName} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/mypage">
            <UserIcon />
            마이페이지
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
