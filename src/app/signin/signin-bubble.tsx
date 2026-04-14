import { LightningIcon } from "@/components/icons/lightning-icon";
import { cn } from "@/lib/utils";

export function SignInBubble({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-background relative inline-flex items-center justify-center gap-1 rounded-full border px-4 py-3 text-sm font-medium text-[#1A1A1A] shadow-[0_1px_4px_rgba(12,12,13,0.05),0_1px_4px_rgba(12,12,13,0.1)] dark:border-[#4B5563] dark:text-white",
        className,
      )}
    >
      <LightningIcon className="size-4 text-[#FBB11C]" />
      <span>3초만에 빠른 회원가입</span>
      <div className="bg-background absolute -bottom-1.25 left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b dark:border-[#4B5563]" />
    </div>
  );
}
