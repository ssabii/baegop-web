import { ExternalLink, MapPin, Phone, Tag, UtensilsCrossed } from "lucide-react";
import { buildNaverMapLink } from "@/lib/naver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "./review-form";

export default async function RestaurantPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const title = params.title ?? "";
  const link = params.link ?? "";
  const category = params.category ?? "";
  const telephone = params.telephone ?? "";
  const address = params.address ?? "";
  const mapx = params.mapx ?? "";
  const mapy = params.mapy ?? "";
  const imageUrls = params.imageUrls ? params.imageUrls.split(",") : [];

  if (!title || !address) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">잘못된 접근입니다.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        {imageUrls[0] ? (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={imageUrls[0]}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-muted">
            <UtensilsCrossed className="size-12 text-muted-foreground" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              미등록
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {address}
          </p>
          {category && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="size-4 shrink-0" />
              {category}
            </p>
          )}
          {telephone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <a href={`tel:${telephone}`} className="hover:underline">
                {telephone}
              </a>
            </p>
          )}
          {title && address && (
            <a
              href={buildNaverMapLink(title)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-4" />
              네이버에서 보기
            </a>
          )}
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">리뷰를 작성하면 맛집이 등록됩니다</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          첫 리뷰를 남겨주세요!
        </p>
        <div className="mt-4">
          <ReviewForm
            naverItem={{
              title,
              link,
              category,
              telephone,
              address,
              description: "",
              roadAddress: address,
              mapx,
              mapy,
              imageUrls,
            }}
          />
        </div>
      </section>
    </main>
  );
}
