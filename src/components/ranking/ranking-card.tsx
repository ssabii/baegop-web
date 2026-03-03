import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { optimizeSupabaseImageUrl } from "@/lib/image";
import type { RankingUser } from "@/hooks/use-ranking";

interface RankingCardProps {
  user: RankingUser;
  rank: number;
  isCurrentUser: boolean;
}

export function RankingCard({ user, rank, isCurrentUser }: RankingCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        { "bg-primary/5 rounded-lg": isCurrentUser },
      )}
    >
      <span
        className={cn(
          "w-8 text-center text-sm font-bold shrink-0",
          { "text-primary": rank <= 3 },
          { "text-muted-foreground": rank > 3 },
        )}
      >
        {rank}
      </span>
      <Avatar className="size-10 shrink-0">
        <AvatarImage
          src={
            user.avatar_url
              ? optimizeSupabaseImageUrl(user.avatar_url)
              : undefined
          }
        />
        <AvatarFallback>
          <UserRound className="size-10 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <span className={cn("flex-1 text-sm font-medium truncate", { "font-bold": isCurrentUser })}>
        {user.nickname ?? "사용자"}
      </span>
      <span className="shrink-0 text-sm font-bold text-primary">
        {user.total_points}P
      </span>
    </div>
  );
}
