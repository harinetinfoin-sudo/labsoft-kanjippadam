import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, data: { loggedOut: true } });

  response.cookies.set("lms_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
