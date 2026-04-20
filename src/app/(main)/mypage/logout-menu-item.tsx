"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { profileKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";

export function LogoutMenuItem() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.setQueryData(profileKeys.all, null);
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
