import { ButtonHTMLAttributes } from "react";
import { KakaoIcon } from "@/components/icons/kakao-icon";
import { NaverIcon } from "@/components/icons/naver-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { cn } from "@/lib/utils";

type Provider = "kakao" | "naver" | "google";

interface SignInButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: Provider;
}

const iconMap: Record<Provider, React.ReactNode> = {
  kakao: <KakaoIcon className="size-5" />,
  naver: <NaverIcon className="size-4" fill="#03a94d" />,
  google: <GoogleIcon className="size-5" />,
};

const baseClassName =
  "w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-full text-[#1a1a1a] cursor-pointer";

const classNameMap: Record<Provider, string> = {
  kakao: `bg-[oklch(0.9_0.19_102.86)]  hover:bg-[oklch(0.80_0.19_102.86)]`,
  naver:
    "bg-background hover:bg-accent border border-gray-200 dark:text-white dark:border-[var(--border)]",
  google:
    "bg-background hover:bg-accent border border-gray-200 dark:text-white dark:border-[var(--border)]",
};

const textMap: Record<Provider, string> = {
  kakao: "카카오로 시작하기",
  naver: "네이버로 시작하기",
  google: "Google로 시작하기",
};

function SignInButton({ provider, className, ...props }: SignInButtonProps) {
  return (
    <button
      className={cn(baseClassName, classNameMap[provider], className)}
      {...props}
    >
      {iconMap[provider]}
      {textMap[provider]}
    </button>
  );
}

export default SignInButton;
