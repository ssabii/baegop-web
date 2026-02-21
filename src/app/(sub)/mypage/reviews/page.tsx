import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { ReviewCard } from "@/components/reviews";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function MyReviewsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, content, created_at, places(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-muted min-h-dvh">
      <SubHeader title="내 리뷰" />
      {reviews && reviews.length > 0 ? (
        <div className="px-4">
          {reviews.map((review) => {
            const place = review.places as unknown as {
              id: number;
              name: string;
            } | null;
            return (
              <ReviewCard
                key={review.id}
                review={{
                  ...review,
                  place: place ? { id: String(place.id), name: place.name } : null,
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Empty className="border-none">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-none bg-transparent"
              >
                <MessageCircle className="size-12 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">
                작성된 리뷰가 없어요
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </div>
  );
}
