import { notFound } from "next/navigation";
import {
  ExternalLink,
  Flame,
  MapPin,
  Phone,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import { buildNaverMapLink, fetchPlaceDetail } from "@/lib/naver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGallery } from "@/components/image-gallery";
import { ReviewForm } from "./review-form";

export default async function RestaurantPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: placeId } = await params;

  const detail = await fetchPlaceDetail(placeId);
  if (!detail) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <ImageGallery images={detail.imageUrls} alt={detail.name} />
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl">{detail.name}</CardTitle>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              미등록
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {detail.roadAddress || detail.address}
          </p>
          {detail.category && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="size-4 shrink-0" />
              {detail.category}
            </p>
          )}
          {detail.phone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <a href={`tel:${detail.phone}`} className="hover:underline">
                {detail.phone}
              </a>
            </p>
          )}
          <a
            href={buildNaverMapLink(detail.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-4" />
            네이버에서 보기
          </a>
        </CardContent>
      </Card>

      {/* 메뉴 섹션 */}
      {detail.menus.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <UtensilsCrossed className="size-5" />
            메뉴 ({detail.menus.length})
          </h2>
          <ul className="mt-4 divide-y rounded-lg border">
            {detail.menus.map((menu) => (
              <li key={menu.name} className="flex items-center gap-3 px-4 py-3">
                {menu.images.length > 0 ? (
                  <img
                    src={menu.images[0]}
                    alt={menu.name}
                    className="size-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                    <UtensilsCrossed className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{menu.name}</span>
                      {menu.recommend && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <Flame className="size-3" />
                          추천
                        </span>
                      )}
                    </div>
                    {menu.description && (
                      <span className="text-xs text-muted-foreground">
                        {menu.description}
                      </span>
                    )}
                  </div>
                  {menu.price && (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {Number(menu.price).toLocaleString()}원
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          리뷰를 작성하면 맛집이 등록됩니다
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          첫 리뷰를 남겨주세요!
        </p>
        <div className="mt-4">
          <ReviewForm placeDetail={detail} />
        </div>
      </section>
    </main>
  );
}
