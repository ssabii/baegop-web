import { redirect } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { ReviewCard } from "@/components/reviews";

export default async function MyReviewsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, content, created_at, places(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <SubHeader title="내가 쓴 리뷰" />
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
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <MessageSquarePlus className="size-8" />
          <p className="text-sm">아직 작성한 리뷰가 없습니다.</p>
        </div>
      )}
    </>
  );
}
