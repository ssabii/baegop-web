import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { matchesCategory } from "@/lib/category";
import { CATEGORY_FILTERS, type CategoryFilter } from "@/lib/constants";
import type { RandomPlace } from "./types";

function parseCategories(param: string | null): CategoryFilter[] {
  if (!param) return [];
  return param
    .split(",")
    .filter((v): v is CategoryFilter =>
      CATEGORY_FILTERS.includes(v as CategoryFilter),
    );
}

function buildQueryString(
  categories: CategoryFilter[],
  konaOnly: boolean,
): string {
  const params = new URLSearchParams();
  if (categories.length > 0) {
    params.set("categories", categories.join(","));
  }
  if (konaOnly) {
    params.set("kona", "true");
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useRoulette(places: RandomPlace[]) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 로컬 state가 source of truth, URL은 동기화용
  const [categories, setCategories] = useState<CategoryFilter[]>(() =>
    parseCategories(searchParams.get("categories")),
  );
  const [konaOnly, setKonaOnly] = useState(
    () => searchParams.get("kona") === "true",
  );
  const [result, setResult] = useState<RandomPlace | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  function syncUrl(
    newCategories: CategoryFilter[],
    newKonaOnly: boolean,
  ) {
    router.replace(`/random${buildQueryString(newCategories, newKonaOnly)}`, {
      scroll: false,
    });
  }

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (categories.length > 0) {
        const matchesAny = categories.some((cat) =>
          matchesCategory(place.category, cat),
        );
        if (!matchesAny) return false;
      }

      if (konaOnly && place.kona_card_status !== "available") {
        return false;
      }

      return true;
    });
  }, [places, categories, konaOnly]);

  const spin = useCallback(() => {
    if (filteredPlaces.length === 0) return;

    setIsSpinning(true);

    // Fisher-Yates 셔플로 애니메이션 순서 결정
    const shuffled = [...filteredPlaces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 최종 결과가 이전 결과와 같으면 다른 장소로 교체
    const finalIndex = shuffled.length - 1;
    if (shuffled[finalIndex].id === result?.id && shuffled.length > 1) {
      [shuffled[finalIndex], shuffled[0]] = [shuffled[0], shuffled[finalIndex]];
    }

    const totalTicks = Math.min(shuffled.length, 15);
    let count = 0;
    const interval = setInterval(() => {
      setResult(shuffled[count % shuffled.length]);
      count++;

      if (count >= totalTicks) {
        clearInterval(interval);
        setResult(shuffled[finalIndex]);
        setIsSpinning(false);
      }
    }, 100);
  }, [filteredPlaces, result]);

  function handleFilterApply(
    newCategories: CategoryFilter[],
    newKonaOnly: boolean,
  ) {
    const categoriesChanged =
      newCategories.length !== categories.length ||
      newCategories.some((c) => !categories.includes(c));
    const konaChanged = newKonaOnly !== konaOnly;

    if (categoriesChanged || konaChanged) {
      setCategories(newCategories);
      setKonaOnly(newKonaOnly);
      syncUrl(newCategories, newKonaOnly);
      setResult(null);
    }
  }

  function handleRemoveCategory(category: CategoryFilter) {
    const newCategories = categories.filter((c) => c !== category);
    setCategories(newCategories);
    setKonaOnly(konaOnly);
    syncUrl(newCategories, konaOnly);
    setResult(null);
  }

  function handleRemoveKona() {
    setKonaOnly(false);
    syncUrl(categories, false);
    setResult(null);
  }

  return {
    result,
    isSpinning,
    categories,
    konaOnly,
    filteredPlaces,
    spin,
    handleFilterApply,
    handleRemoveCategory,
    handleRemoveKona,
  };
}
