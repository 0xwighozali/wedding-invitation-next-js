// src/app/api/auth/change-password/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Asumsi ini adalah connection pool PostgreSQL Anda
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// --- Fungsi helper untuk mendapatkan email pengguna dari token sesi ---
const getUserEmailFromAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    console.error("JWT_SECRET_KEY is not defined in environment variables.");
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    return decoded.email;
  } catch (error) {
    console.error(
      "Gagal memverifikasi token otentikasi untuk API ubah kata sandi:",
      error
    );
    return null;
  }
};

export async function PUT(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();

    const userEmail = await getUserEmailFromAuthToken();

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau tidak diotorisasi." },
        { status: 401 }
      );
    }

    // --- PERBAIKAN DI SINI: Gunakan string SQL dan array parameter terpisah ---
    const userResult = await pool.query(
      "SELECT id, password FROM users WHERE email = $1",
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const storedHash = user.password;

    const isPasswordValid = await bcrypt.compare(currentPassword, storedHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Kata sandi saat ini salah." },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // --- PERBAIKAN DI SINI: Gunakan string SQL dan array parameter terpisah ---
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      newPasswordHash,
      user.id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Kata sandi berhasil diubah.",
    });
  } catch (error) {
    console.error("Error API saat mengubah kata sandi:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
