import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";

export default function SubLayout({ children }: { children: React.ReactNode }) {
  return <ConfirmDialogProvider>{children}</ConfirmDialogProvider>;
}
