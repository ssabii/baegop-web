import { createClient } from "@/lib/supabase/client";

export async function uploadFeedbackImages(
  files: File[],
): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");

  const results = await Promise.all(
    files.map(async (file) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("feedback-images")
        .upload(path, file);

      if (error) return null;

      const {
        data: { publicUrl },
      } = supabase.storage.from("feedback-images").getPublicUrl(path);
      return publicUrl;
    }),
  );

  return results.filter((url): url is string => url !== null);
}
