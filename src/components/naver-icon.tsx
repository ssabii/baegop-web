import { cn } from "@/lib/utils";

export function NaverIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn("size-4", className)}
    >
      <path d="M13.27 10.61 6.41 1H1v18h5.73V9.39L13.59 19H19V1h-5.73v9.61Z" />
    </svg>
  );
}
