"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { profileQueryKey } from "@/hooks/use-profile";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";

export function LogoutMenuItem() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.setQueryData(profileQueryKey, null);
    router.refresh();
    router.push("/signin");
  };

  return (
    <Item asChild>
      <button onClick={handleLogout} className="cursor-pointer">
        <ItemContent>
          <ItemTitle className="font-bold">로그아웃</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="size-4" />
        </ItemActions>
      </button>
    </Item>
  );
}
