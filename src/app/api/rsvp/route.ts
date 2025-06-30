import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Pastikan path ini benar

export async function POST(request: Request) {
  try {
    const { customUrlSlug, inviteCode, status, people_count } =
      await request.json();

    // --- 1. Validasi Input Dasar dan Status ---
    // Pastikan semua input dasar ada
    if (!customUrlSlug || !inviteCode || !status) {
      return NextResponse.json(
        {
          message: "Data RSVP tidak lengkap (URL, kode undangan, atau status).",
        },
        { status: 400 }
      );
    }

    // Pastikan status hanya 'hadir' atau 'tidak hadir'
    if (!["hadir", "tidak hadir"].includes(status)) {
      return NextResponse.json(
        {
          message:
            "Status RSVP tidak valid. Hanya 'hadir' atau 'tidak hadir' yang diperbolehkan.",
        },
        { status: 400 }
      );
    }

    // --- 2. Tentukan Final people_count Berdasarkan Status ---
    let finalPeopleCount: number;

    if (status === "tidak hadir") {
      finalPeopleCount = 0; // PENTING: Jika status 'tidak hadir', people_count harus 0
    } else {
      // Jika status 'hadir'
      // Validasi people_count untuk status 'hadir'
      if (people_count === undefined || people_count < 1) {
        // Jika people_count tidak valid untuk status 'hadir', default ke 1
        finalPeopleCount = 1;
        console.warn(
          `[RSVP API] people_count tidak valid untuk status 'hadir', default ke 1. Payload: ${JSON.stringify(
            { customUrlSlug, inviteCode, status, people_count }
          )}`
        );
      } else {
        finalPeopleCount = people_count;
      }
    }

    // --- 3. Cari guest_id berdasarkan inviteCode dan customUrlSlug ---
    const guestDataResult = await pool.query(
      `SELECT
         g.id as guest_id
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

    const { guest_id } = guestDataResult.rows[0];

    // --- 4. Gunakan UPSERT (INSERT ... ON CONFLICT) untuk menyederhanakan logika ---
    // Ini lebih efisien daripada SELECT terpisah lalu INSERT/UPDATE
    const upsertQuery = `
      INSERT INTO rsvp (guest_id, status, people_count, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (guest_id) DO UPDATE SET
        status = EXCLUDED.status,
        people_count = EXCLUDED.people_count,
        updated_at = NOW()
      RETURNING *;
    `;

    await pool.query(upsertQuery, [guest_id, status, finalPeopleCount]);

    return NextResponse.json(
      { message: "RSVP berhasil dikirim/diperbarui!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error submitting RSVP:", error);
    return NextResponse.json(
      {
        message: "Gagal memproses RSVP karena kesalahan server.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
