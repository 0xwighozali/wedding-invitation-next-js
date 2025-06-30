import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Pastikan path ini benar

export async function POST(request: Request) {
  try {
    const { customUrlSlug, inviteCode, status, people_count } =
      await request.json();

    // Validasi input dasar
    if (
      !customUrlSlug ||
      !inviteCode ||
      !status ||
      (status === "hadir" && (people_count === undefined || people_count < 1))
    ) {
      return NextResponse.json(
        {
          message:
            "Data RSVP tidak lengkap (URL, kode undangan, status, atau jumlah tamu).",
        },
        { status: 400 }
      );
    }

    // Pastikan status hanya 'hadir' atau 'tidak hadir'
    if (!["hadir", "tidak hadir"].includes(status)) {
      return NextResponse.json(
        { message: "Status RSVP tidak valid." },
        { status: 400 }
      );
    }

    // Cari guest_id berdasarkan inviteCode dan customUrlSlug
    // personalize_id hanya akan digunakan untuk validasi, tidak disimpan di tabel rsvp
    const guestDataResult = await pool.query(
      `SELECT
         g.id as guest_id,
         p.id as personalize_id -- tetap ambil personalize_id untuk validasi
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

    const { guest_id } = guestDataResult.rows[0]; // Hanya ambil guest_id

    // Periksa apakah tamu sudah RSVP sebelumnya
    const existingRsvp = await pool.query(
      "SELECT id FROM rsvp WHERE guest_id = $1",
      [guest_id]
    );

    if (existingRsvp.rows.length > 0) {
      // Jika tamu sudah RSVP, update data yang ada
      await pool.query(
        `UPDATE rsvp
         SET status = $1, people_count = $2, created_at = NOW()
         WHERE guest_id = $3`,
        [status, people_count, guest_id]
      );
      return NextResponse.json(
        { message: "RSVP berhasil diperbarui!" },
        { status: 200 }
      );
    } else {
      // Jika tamu belum RSVP, masukkan data baru
      await pool.query(
        `INSERT INTO rsvp (guest_id, status, people_count)
         VALUES ($1, $2, $3)`,
        [guest_id, status, people_count] // Hapus personalize_id dari sini
      );
      return NextResponse.json(
        { message: "RSVP berhasil dikirim!" },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error submitting RSVP:", error);
    return NextResponse.json(
      { message: "Gagal memproses RSVP.", error: error.message },
      { status: 500 }
    );
  }
}
