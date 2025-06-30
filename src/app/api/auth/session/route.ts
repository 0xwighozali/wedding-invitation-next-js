// src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies(); // Pastikan ada 'await'
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      {
        isAuthenticated: false,
        user: null,
        personalizeId: null,
        message: "No authentication token found.",
      },
      { status: 401 }
    );
  }

  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    console.error("JWT_SECRET_KEY is not defined in environment variables.");
    return NextResponse.json(
      {
        isAuthenticated: false,
        user: null,
        personalizeId: null,
        message: "Server configuration error.",
      },
      { status: 500 }
    );
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    return NextResponse.json(
      {
        isAuthenticated: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          personalizeId: decoded.personalizeId, // <-- AMBIL personalizeId DARI TOKEN
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to verify session token:", error);
    await cookieStore.delete("auth_token"); // Pastikan ada 'await'
    return NextResponse.json(
      {
        isAuthenticated: false,
        user: null,
        personalizeId: null,
        message: "Invalid or expired session token.",
      },
      { status: 401 }
    );
  }
}
