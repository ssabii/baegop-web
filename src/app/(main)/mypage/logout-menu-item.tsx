"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";

export function LogoutMenuItem() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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
