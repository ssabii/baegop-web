import { useSuspenseQuery } from "@tanstack/react-query";

export interface Profile {
  nickname: string;
  avatarUrl: string | null;
  email: string | null;
}

export const profileQueryKey = (userId: string) => [
  "mypage",
  "profile",
  userId,
];

export function useProfile(userId: string) {
  const { data } = useSuspenseQuery({
    queryKey: profileQueryKey(userId),
    queryFn: async () => {
      const res = await fetch("/api/mypage/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json() as Promise<Profile>;
    },
    staleTime: Infinity,
  });

  return { profile: data };
}
