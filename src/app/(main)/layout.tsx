import { BottomNav } from "@/components/bottom-nav";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmDialogProvider>
      <main className="pb-20">{children}</main>
      <BottomNav />
    </ConfirmDialogProvider>
  );
}
