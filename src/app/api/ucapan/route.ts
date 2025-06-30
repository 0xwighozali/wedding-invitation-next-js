import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Pastikan path ini benar

export async function POST(request: Request) {
  try {
    // Ambil customUrlSlug dan inviteCode dari body request
    const { customUrlSlug, inviteCode, name, message } = await request.json();

    // Validasi input
    if (!customUrlSlug || !inviteCode || !name || !message) {
      return NextResponse.json(
        { message: "Nama, pesan ucapan, kode undangan, dan URL harus diisi." },
        { status: 400 }
      );
    }

    // Cari guest_id dan personalize_id berdasarkan inviteCode dan customUrlSlug
    const guestDataResult = await pool.query(
      `SELECT
         g.id as guest_id,
         p.id as personalize_id
       FROM guests g
       JOIN personalize p ON g.personalize_id = p.id
       WHERE g.code = $1 AND p.custom_url = $2`,
      [inviteCode, customUrlSlug]
    );

    if (guestDataResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Kode undangan atau URL tidak ditemukan." },
        { status: 404 }
      );
    }

    const { guest_id, personalize_id } = guestDataResult.rows[0];

    // Masukkan data ucapan ke database
    // Gunakan guest_id yang sudah ditemukan
    await pool.query(
      `INSERT INTO ucapan (personalize_id, guest_id, name, message)
       VALUES ($1, $2, $3, $4)`,
      [personalize_id, guest_id, name, message]
    );

    return NextResponse.json(
      { message: "Ucapan berhasil dikirim!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting ucapan:", error);
    return NextResponse.json(
      { message: "Gagal mengirim ucapan.", error: error.message },
      { status: 500 }
    );
  }
}
