import { cn } from "@/lib/utils";

type DrawerBodyProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * DrawerContent 바로 아래에 두는 최대폭·패딩 래퍼.
 * CLAUDE.md 컨벤션: 모든 Drawer 내부 콘텐츠는 이 래퍼 안에 위치한다.
 */
export function DrawerBody({ className, ...props }: DrawerBodyProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-4xl p-4", className)}
      {...props}
    />
  );
}
