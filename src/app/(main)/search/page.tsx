import { RestaurantSearch } from "@/components/restaurant-search";

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">맛집 검색</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        네이버 검색으로 맛집을 찾아보세요
      </p>

      <div className="mt-6">
        <RestaurantSearch />
      </div>
    </main>
  );
}
