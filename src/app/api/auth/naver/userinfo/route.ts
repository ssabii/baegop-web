import { NextResponse } from "next/server";

const NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      {
        error: "missing_token",
        error_description: "Authorization header is required",
      },
      { status: 401 },
    );
  }

  const response = await fetch(NAVER_USERINFO_URL, {
    headers: { Authorization: authorization },
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "provider_error",
        error_description: "Failed to fetch user info from Naver",
      },
      { status: response.status },
    );
  }

  const data = await response.json();

  if (data.resultcode !== "00" || !data.response) {
    return NextResponse.json(
      {
        error: "invalid_response",
        error_description: "Invalid response from Naver",
      },
      { status: 502 },
    );
  }

  const { id, email, nickname, profile_image } = data.response;

  if (!email) {
    return NextResponse.json(
      {
        error: "email_required",
        error_description: "Email is required but not provided by Naver",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    sub: id,
    email,
    email_verified: true,
    name: nickname,
    picture: profile_image,
  });
}
