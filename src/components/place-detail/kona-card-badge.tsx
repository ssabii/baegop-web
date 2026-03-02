import { cn } from "@/lib/utils";
import type { KonaCardStatus } from "@/types";

interface KonaCardBadgeProps {
  status: KonaCardStatus;
}

export function KonaCardBadge({ status }: KonaCardBadgeProps) {
  if (status === "unknown") return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-1 text-xs font-medium",
        {
          "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300":
            status === "available",
          "bg-muted text-muted-foreground": status !== "available",
        },
      )}
    >
      <img
        src="/icons/kona.png"
        alt="코나카드"
        className="size-3 rounded-full"
      />
      {status === "available" ? "결제가능" : "결제불가"}
    </span>
  );
}
