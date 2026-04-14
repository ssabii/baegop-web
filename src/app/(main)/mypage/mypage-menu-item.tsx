import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

type MypageMenuItemProps = {
  href: string;
  title: string;
  badge?: React.ReactNode;
  /** true이면 타이틀 옆에 빨간 점 표시 (새 기능 강조) */
  newBadge?: boolean;
  /** true이면 ItemGroup으로 감싸지 않고 Item만 렌더 (여러 항목을 한 그룹에 넣을 때 사용) */
  inGroup?: boolean;
  variant?: "default" | "destructive";
};

export function MypageMenuItem({
  href,
  title,
  badge,
  newBadge = false,
  inGroup = false,
  variant = "default",
}: MypageMenuItemProps) {
  const isDestructive = variant === "destructive";

  const content = (
    <Item asChild>
      <Link href={href}>
        <ItemContent>
          <ItemTitle
            className={cn("font-bold", { "text-destructive": isDestructive })}
          >
            {newBadge ? (
              <span className="relative">
                {title}
                <span className="absolute -top-0.5 -right-2.5 size-2 rounded-full bg-red-500" />
              </span>
            ) : (
              title
            )}
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          {badge}
          <ChevronRight className="size-4" />
        </ItemActions>
      </Link>
    </Item>
  );

  if (inGroup) {
    return content;
  }

  return <ItemGroup className="bg-background rounded-xl">{content}</ItemGroup>;
}
