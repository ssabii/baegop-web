export interface Profile {
  nickname: string;
  avatarUrl: string | null;
  email: string | null;
  totalPoints: number;
}

interface ProfileRow {
  nickname: string | null;
  avatar_url: string | null;
  total_points: number | null;
}

export function getMaskedEmail(email: string): string {
  const [local, domain] = email.split("@");

  if (!local) return email;

  const maskedLocal =
    local.length <= 2 ? "*".repeat(local.length) : local.slice(0, 2) + "******";

  if (!domain) return maskedLocal;

  const dotIndex = domain.indexOf(".");
  if (dotIndex <= 0) return `${maskedLocal}@${"*******"}`;

  const maskedDomain = domain.slice(0, 1) + "*******" + domain.slice(dotIndex);

  return `${maskedLocal}@${maskedDomain}`;
}

/** auth user + profiles 행을 UI용 Profile 형태로 변환한다. 클라이언트·서버 공용. */
export function buildProfile(
  user: { email?: string | null },
  profile: ProfileRow | null,
): Profile {
  return {
    nickname: profile?.nickname ?? user.email ?? "사용자",
    avatarUrl: profile?.avatar_url ?? null,
    email: user.email ? getMaskedEmail(user.email) : null,
    totalPoints: profile?.total_points ?? 0,
  };
}
