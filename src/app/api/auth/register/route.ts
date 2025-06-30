// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Ini sekarang adalah instance Pool dari 'pg'
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validasi Input Dasar
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Cek apakah email sudah digunakan
    // Menggunakan pool.query() dengan placeholder $1 dan array parameter
    const existingUsers = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUsers.rows.length > 0) {
      // Hasil query dari 'pg' ada di properti .rows
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    // 3. Hash Kata Sandi
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat ID Pengguna Unik (UUID v4)
    const userId = uuidv4();

    // 5. Simpan Pengguna Baru ke Database
    // Menggunakan pool.query() dengan placeholder $1, $2, $3 dan array parameter
    await pool.query(
      "INSERT INTO users (id, email, password, created_at) VALUES ($1, $2, $3, NOW())",
      [userId, email, hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil. Silahkan Login!",
    });
  } catch (err) {
    console.error("Error during registration:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
