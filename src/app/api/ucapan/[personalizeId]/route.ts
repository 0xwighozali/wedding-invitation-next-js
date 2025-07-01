import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: { personalizeId: string } }
) {
  const { personalizeId } = context.params;

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
    console.error("Error fetching ucapan:", error);
    return NextResponse.json(
      { message: "Gagal mengambil ucapan.", error: error.message },
      { status: 500 }
    );
  }
}
