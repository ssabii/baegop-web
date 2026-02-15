import { RestaurantSearch } from "@/components/restaurant-search";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="text-primary">배곱</span>
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        함께 만들어가는 회사 주변 맛집 추천 서비스
      </p>

      <div className="mt-10 w-full max-w-md">
        <RestaurantSearch />
      </div>
    </main>
  );
}
