import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
  /** true이면 ItemGroup으로 감싸지 않고 Item만 렌더 (여러 항목을 한 그룹에 넣을 때 사용) */
  inGroup?: boolean;
};

export function MypageMenuItem({
  href,
  title,
  badge,
  inGroup = false,
}: MypageMenuItemProps) {
  const content = (
    <Item asChild>
      <Link href={href}>
        <ItemContent>
          <ItemTitle className="font-bold">{title}</ItemTitle>
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

  return (
    <ItemGroup className="rounded-xl bg-background">{content}</ItemGroup>
  );
}
