import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestaurantThumbnailProps {
  imageUrl?: string;
  name: string;
  // 결과 카드는 둥근 모서리(true), 상세 페이지는 전체 폭 헤더라 각진 모서리(false)
  rounded?: boolean;
}

// 맛집 이미지가 있으면 표시하고, 없으면 포크&나이프 아이콘 플레이스홀더를 보여준다.
// 결과 카드와 상세 페이지에서 공통으로 사용한다.
export function RestaurantThumbnail({
  imageUrl,
  name,
  rounded = false,
}: RestaurantThumbnailProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("aspect-[16/10] w-full object-cover", {
          "rounded-xl": rounded,
        })}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-[16/10] w-full items-center justify-center",
        "bg-gradient-to-br from-orange-100 to-orange-200",
        { "rounded-xl": rounded },
      )}
    >
      <UtensilsCrossed className="size-16 text-orange-400/50" />
    </div>
  );
}
