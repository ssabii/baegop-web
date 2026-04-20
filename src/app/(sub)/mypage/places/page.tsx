import { redirect } from "next/navigation";
import { SubHeader } from "@/components/sub-header";
import { createClient } from "@/lib/supabase/server";
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
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <MyPlaceList />
      </div>
    </div>
  );
}
