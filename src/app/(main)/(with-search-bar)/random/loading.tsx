import { Spinner } from "@/components/ui/spinner";

export default function RandomLoading() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-3 px-4">
      <Spinner className="text-primary size-10" aria-label="로딩 중" />
    </main>
  );
}
