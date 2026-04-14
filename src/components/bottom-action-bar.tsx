import { cn } from "@/lib/utils";

function BottomActionBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-background fixed right-0 bottom-0 left-0 z-50 border-t px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

export { BottomActionBar };
