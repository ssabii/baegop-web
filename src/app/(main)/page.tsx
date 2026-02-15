import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="text-primary">배곱</span>
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        함께 만들어가는 회사 주변 맛집 추천 서비스
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/restaurants">맛집 둘러보기</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/restaurants/new">맛집 등록하기</Link>
        </Button>
      </div>
    </main>
  );
}
