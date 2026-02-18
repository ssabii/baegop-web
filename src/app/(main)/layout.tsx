import { BottomNav } from "@/components/bottom-nav";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmDialogProvider>
      {children}
      <BottomNav />
    </ConfirmDialogProvider>
  );
}
