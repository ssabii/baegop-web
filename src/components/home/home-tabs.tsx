"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HomeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "recent";

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "recent") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "/", { scroll: false });
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList className="w-full">
        <TabsTrigger value="recent" className="cursor-pointer">최근</TabsTrigger>
        <TabsTrigger value="popular" className="cursor-pointer">인기</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
