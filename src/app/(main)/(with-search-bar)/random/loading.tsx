import { Spinner } from "@/components/ui/spinner";

export default function RandomLoading() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-3 px-4">
      <Spinner className="size-10 text-primary" aria-label="로딩 중" />
    </main>
  );
}
