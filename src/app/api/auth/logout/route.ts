// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logout berhasil." },
    { status: 200 }
  );

  // Hapus cookie dengan cara set ulang dan expired segera
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // Hapus cookie langsung
    sameSite: "lax",
  });

  return response;
}
