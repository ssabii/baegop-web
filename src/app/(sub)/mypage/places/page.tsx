import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubHeader } from "@/components/sub-header";
import { MyPlaceList } from "./my-place-list";

export default async function MyPlacesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="flex min-h-dvh flex-col">
      <SubHeader title="내 장소" />
      <div className="flex flex-1 flex-col">
        <MyPlaceList userId={user.id} />
      </div>
    </div>
  );
}
