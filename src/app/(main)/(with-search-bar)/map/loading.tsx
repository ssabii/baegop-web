import { Spinner } from "@/components/ui/spinner";

export default function MapLoading() {
  return (
    <main className="flex h-[calc(100svh-8rem)] flex-col items-center justify-center gap-3 px-4">
      <Spinner className="size-10 text-primary" aria-label="로딩 중" />
      <p className="text-sm text-muted-foreground">로딩 중</p>
    </main>
  );
}
