import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "sc_dash_auth";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as { password?: string }));
  const password = (body as { password?: string }).password ?? "";
  const expected = process.env.DASHBOARD_PASSWORD ?? "";

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Server password not configured" },
      { status: 500 },
    );
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
