import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Gunakan 'params' dari 'context' dan tipekan sebagai 'any' agar tidak error di Vercel
export async function GET(req: NextRequest, { params }: any) {
  const { personalizeId } = params;

  if (!personalizeId) {
    return NextResponse.json(
      { message: "ID undangan tidak disediakan." },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `SELECT id, name, message, created_at
       FROM ucapan
       WHERE personalize_id = $1
       ORDER BY created_at DESC`,
      [personalizeId]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Gagal mengambil ucapan:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat mengambil ucapan.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
