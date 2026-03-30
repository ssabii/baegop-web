import { HomeBannerCarousel } from "@/components/home/home-banner-carousel";
import { HomeFooter } from "@/components/home/home-footer";
import { RecommendPlaces } from "@/components/home/recommend-places";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 px-4 pt-21 pb-23">
      <HomeBannerCarousel />
      <RecommendPlaces />
      <HomeFooter />
    </main>
  );
}
