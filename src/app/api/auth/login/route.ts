// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Asumsi Anda memiliki koneksi database
import bcrypt from "bcrypt"; // Menggunakan 'bcrypt' sesuai permintaan
import jwt from "jsonwebtoken"; // Untuk membuat JWT
// Tidak perlu import `cookies` dari 'next/headers' secara langsung untuk set cookie di response

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Verifikasi pengguna dari tabel 'users'
    // Asumsi kolom password di tabel users adalah `password_hash`
    const userResult = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi salah." },
        { status: 401 }
      );
    }

    // 2. Ambil personalize_id yang terkait dengan user_id ini
    // Asumsi: Setiap user punya 1 entri di personalize. Sesuaikan jika 1 user bisa punya banyak.
    const personalizeResult = await pool.query(
      "SELECT id FROM personalize WHERE user_id = $1",
      [user.id]
    );
    const personalizeEntry = personalizeResult.rows[0];

    if (!personalizeEntry) {
      // Ini bisa terjadi jika user sudah terdaftar tapi belum membuat entri personalisasi
      return NextResponse.json(
        {
          success: false,
          message:
            "Data personalisasi tidak ditemukan untuk pengguna ini. Silakan hubungi admin atau buat personalisasi baru.",
        },
        { status: 404 }
      );
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      // Ini adalah error konfigurasi yang harus ditangani di lingkungan Anda
      throw new Error(
        "JWT_SECRET_KEY is not defined in environment variables."
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        personalizeId: personalizeEntry.id, // <-- Tambahkan personalizeId ke token
      },
      secret,
      { expiresIn: "1h" } // Token berlaku 1 jam
    );

    // 3. Buat objek NextResponse untuk respons
    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil!",
        userId: user.id,
        personalizeId: personalizeEntry.id,
      },
      { status: 200 }
    );

    // 4. Set cookie pada objek NextResponse
    response.cookies.set("auth_token", token, {
      httpOnly: true, // Tidak bisa diakses oleh JavaScript di browser (keamanan)
      secure: process.env.NODE_ENV === "production", // Hanya kirim via HTTPS di produksi
      maxAge: 60 * 60, // 1 jam dalam detik
      path: "/", // Cookie berlaku untuk seluruh aplikasi
      sameSite: "lax", // Melindungi dari CSRF, 'strict' bisa terlalu ketat untuk beberapa kasus
    });

    return response; // Kembalikan objek response yang sudah memiliki cookie
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat login." },
      { status: 500 }
    );
  }
}
