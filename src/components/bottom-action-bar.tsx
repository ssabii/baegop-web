import { cn } from "@/lib/utils";

function BottomActionBar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

export { BottomActionBar };
