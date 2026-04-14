import { LightningIcon } from "@/components/icons/lightning-icon";
import { cn } from "@/lib/utils";

export function SignInBubble({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center gap-1 rounded-full border bg-background px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-white justify-center shadow-[0_1px_4px_rgba(12,12,13,0.05),0_1px_4px_rgba(12,12,13,0.1)] dark:border-[#4B5563]", className)}>
      <LightningIcon className="size-4 text-[#FBB11C]" />
      <span>3초만에 빠른 회원가입</span>
      <div className="absolute -bottom-1.25 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r bg-background dark:border-[#4B5563]" />
    </div>
  );
}
