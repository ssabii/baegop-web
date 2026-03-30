# 네이버 로그인 연동

## 아키텍처

네이버 OAuth를 Supabase 커스텀 OIDC 프로바이더로 연동. 로그인 플로우는 카카오/구글과 동일하게 Supabase OAuth 플로우를 사용하며, 세션/토큰 생성은 모두 Supabase가 처리.

### 왜 프록시가 필요한가?

네이버 userinfo API(`https://openapi.naver.com/v1/nid/me`)는 OIDC 표준을 따르지 않는 중첩 응답 구조를 반환한다:

```json
{
  "resultcode": "00",
  "message": "success",
  "response": {
    "id": "고유식별자",
    "email": "user@email.com",
    "nickname": "닉네임",
    "profile_image": "https://..."
  }
}
```

Supabase 커스텀 OIDC는 표준 OIDC 형식(`{ "sub": "...", "email": "..." }`)을 기대하며, 중첩 응답 매핑을 지원하지 않는다. 이로 인해 "Error getting user email from external provider" 에러가 발생.

### 플로우

```
클라이언트 (signInWithOAuth)
  → 네이버 인증 페이지
  → Supabase OAuth 콜백
  → Supabase가 Userinfo URL 호출 (프록시)
  → 프록시가 네이버 API 호출 + 표준 OIDC 형태로 변환
  → Supabase 세션/JWT 생성
  → /auth/callback → exchangeCodeForSession → 리다이렉트
```

프록시(`/api/auth/naver/userinfo`)는 Supabase가 호출하는 Userinfo URL만 대체. 나머지 플로우는 카카오/구글과 동일.

## 네이버 API 특이사항

- **`id` 필드**: 실제 네이버 아이디가 아닌 **고유 식별자** (문자열). 인증 목적으로만 사용.
- **`email` 필드**: 사용자가 동의를 거부하거나 "연결된 서비스 관리"에서 철회하면 미제공 가능.
- **응답 구조**: 모든 사용자 정보가 `response` 객체 안에 중첩되어 있음 (비표준).

## 이메일 정책

**이메일 필수**. 네이버에서 이메일을 제공하지 않으면 로그인 차단.

- 네이버 개발자센터에서 "연락처 이메일 주소"를 **필수** 항목으로 설정.
- 프록시에서 이메일이 없으면 400 에러 반환 → Supabase 로그인 실패.
- 사용자에게 "이메일 제공에 동의해주세요" 안내 토스트 노출.

### 이메일 엣지 케이스

| 시나리오 | 동작 |
|---------|------|
| 이메일 제공됨 + 기존 계정 없음 | 새 계정 생성 |
| 이메일 제공됨 + 동일 이메일 계정 존재 | 기존 계정에 네이버 identity 자동 연결 (Supabase identity linking) |
| 이메일 미제공 (동의 거부/철회) | 로그인 차단 + 에러 메시지 안내 |

## Supabase 대시보드 설정

Authentication > Providers > Custom OIDC (naver):

| 항목 | 값 |
|------|-----|
| Authorization URL | `https://nid.naver.com/oauth2.0/authorize` |
| Token URL | `https://nid.naver.com/oauth2.0/token` |
| Userinfo URL | `https://www.baegop.com/api/auth/naver/userinfo` (프록시) |
| JWKS URI | `https://nid.naver.com/.well-known/jwks.json` |
| Client ID | 네이버 개발자센터에서 발급 |
| Client Secret | 네이버 개발자센터에서 발급 |

## 네이버 개발자센터 설정

- **서비스 URL**: `https://www.baegop.com/`
- **Callback URL**: `https://{supabase-project-ref}.supabase.co/auth/v1/callback`
- **API 권한**: 연락처 이메일 주소 (필수), 별명 (필수), 프로필 사진 (필수)

## 관련 파일

- `src/app/api/auth/naver/userinfo/route.ts` — Userinfo 프록시 API
- `src/app/auth/callback/route.ts` — OAuth 콜백 (에러 분기 포함)
- `src/app/signin/signin-form.tsx` — 로그인 폼 (네이버 버튼 + 에러 토스트)
- `src/components/naver-icon.tsx` — 네이버 아이콘 컴포넌트
