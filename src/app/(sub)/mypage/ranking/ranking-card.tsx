import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { RankingUser } from "@/hooks/use-ranking";

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-500 text-white",
  2: "bg-gray-400 text-white",
  3: "bg-amber-700 text-white",
};

interface RankingCardProps {
  user: RankingUser;
  rank: number;
  isCurrentUser: boolean;
}

export function RankingCard({ user, rank, isCurrentUser }: RankingCardProps) {
  return (
    <div
      className={cn("flex items-center gap-2 px-4 py-3", {
        "bg-primary/10 dark:bg-primary/20": isCurrentUser,
      })}
    >
      <div className="flex w-8 shrink-0 justify-center">
        <span
          className={cn(
            "text-sm font-bold",
            RANK_STYLES[rank]
              ? cn(
                  "flex size-6 items-center justify-center rounded-full",
                  RANK_STYLES[rank],
                )
              : "text-muted-foreground",
          )}
        >
          {rank}
        </span>
      </div>
      <Avatar className="size-10 shrink-0">
        <AvatarImage
          src={
            user.avatar_url
              ? optimizeSupabaseImageUrl(user.avatar_url)
              : undefined
          }
        />
        <AvatarFallback>
          <UserRound className="text-muted-foreground size-10" />
        </AvatarFallback>
      </Avatar>
      <span
        className={cn("flex-1 truncate text-sm font-medium", {
          "font-bold": isCurrentUser,
        })}
      >
        {user.nickname ?? "사용자"}
      </span>
      <span
        className={cn("text-muted-foreground shrink-0 text-sm font-bold", {
          "text-accent-foreground": isCurrentUser,
        })}
      >
        {user.total_points.toLocaleString()}P
      </span>
    </div>
  );
}
