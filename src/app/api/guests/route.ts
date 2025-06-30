// src/app/api/guests/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Pastikan ini mengimpor pool
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// --- Helper function untuk mendapatkan personalizeId dari token sesi ---
const getPersonalizeIdFromAuthToken = async () => {
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
    return decoded.personalizeId;
  } catch (error) {
    console.error("Failed to verify auth token:", error);
    return null;
  }
};

// --- GET Request: Ambil semua tamu dengan data RSVP terkait ---
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const personalizeId = searchParams.get("personalize_id");

  if (!personalizeId) {
    return NextResponse.json(
      {
        success: false,
        error: "personalize_id is required as a query parameter.",
      },
      { status: 400 }
    );
  }

  const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();
  if (!authorizedPersonalizeId || authorizedPersonalizeId !== personalizeId) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized access or invalid personalize ID.",
      },
      { status: 403 }
    );
  }

  try {
    // MODIFIKASI: Lakukan LEFT JOIN dengan tabel rsvp_responses
    const result = await pool.query(
      `SELECT
        g.id,
        g.name,
        g.phone,
        g.address,
        g.code,
        g.invitation_type,
        g.is_sent,
        COALESCE(r.status, '-') AS status, -- Ambil status dari rsvp, default '-'
        COALESCE(r.people_count, 0) AS people_count -- Ambil people_count dari rsvp, default 0
      FROM
        guests g
      LEFT JOIN
        rsvp r ON g.id = r.guest_id -- ASUMSI: Nama tabel RSVP Anda adalah rsvp_responses
      WHERE
        g.personalize_id = $1
      ORDER BY
        g.created_at DESC`,
      [personalizeId]
    );
    return NextResponse.json({ success: true, guests: result.rows });
  } catch (error) {
    console.error("Error fetching guests with RSVP data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch guests due to server error." },
      { status: 500 }
    );
  }
}

// --- POST Request: Tambah tamu baru ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, address, invitation_type, personalize_id } = body;

    const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();
    if (
      !authorizedPersonalizeId ||
      authorizedPersonalizeId !== personalize_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized operation or invalid personalize ID.",
        },
        { status: 403 }
      );
    }

    if (!name || !personalize_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and personalize_id are required fields.",
        },
        { status: 400 }
      );
    }

    const guestId = uuidv4();
    const invitationCode = `INV-${uuidv4().substring(0, 8).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO guests (id, personalize_id, name, phone, address, invitation_type, code, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
      [
        guestId,
        personalize_id,
        name,
        phone,
        address,
        invitation_type,
        invitationCode,
      ]
    );

    // Ketika tamu baru ditambahkan, kita harus memastikan dia juga memiliki status RSVP awal.
    // Jika tabel rsvp_responses akan selalu memiliki entri untuk setiap tamu,
    // maka Anda mungkin ingin menambahkan entri default di sini.
    // Namun, jika RSVP hanya ditambahkan saat tamu merespons, maka tidak perlu insert di sini.
    // Untuk tujuan ini, kita asumsikan RSVP hanya masuk ketika tamu merespons.
    // Dashboard akan menampilkan '-' jika belum ada RSVP.

    return NextResponse.json({ success: true, guest: result.rows[0] });
  } catch (error) {
    console.error("Error adding guest:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add guest due to server error." },
      { status: 500 }
    );
  }
}

// --- PATCH Request: Update tamu ---
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      phone,
      address,
      invitation_type,
      is_sent,
      personalize_id,
      // TAMBAHAN: izinkan update status dan people_count jika diperlukan dari API ini
      // status,
      // people_count
    } = body;

    const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();
    if (
      !authorizedPersonalizeId ||
      authorizedPersonalizeId !== personalize_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized operation or invalid personalize ID.",
        },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Guest ID is required for updating." },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${queryIndex++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${queryIndex++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      fields.push(`address = $${queryIndex++}`);
      values.push(address);
    }
    if (invitation_type !== undefined) {
      fields.push(`invitation_type = $${queryIndex++}`);
      values.push(invitation_type);
    }
    if (is_sent !== undefined) {
      fields.push(`is_sent = $${queryIndex++}`);
      values.push(is_sent);
    }

    fields.push(`updated_at = NOW()`);

    const query = `UPDATE guests SET ${fields.join(
      ", "
    )} WHERE id = $${queryIndex++} AND personalize_id = $${queryIndex++} RETURNING *`;
    values.push(id, personalize_id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Guest not found or unauthorized to update this guest.",
        },
        { status: 404 }
      );
    }

    // Jika Anda juga ingin mengupdate status RSVP dari API ini (misal dari dashboard),
    // Anda perlu logika INSERT/UPDATE ke tabel rsvp_responses juga.
    // Untuk saat ini, kita hanya mengupdate tabel guests.
    // Jika `status` atau `people_count` dikirim, Anda perlu menanganinya di sini
    // dengan INSERT INTO atau UPDATE rsvp_responses.
    // Misalnya:
    /*
    if (status !== undefined || people_count !== undefined) {
      // Logic untuk upsert rsvp_responses
      await pool.query(
        `INSERT INTO rsvp_responses (guest_id, status, people_count, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (guest_id) DO UPDATE SET
           status = EXCLUDED.status,
           people_count = EXCLUDED.people_count,
           updated_at = NOW()`,
        [id, status || result.rows[0].status, people_count || result.rows[0].people_count] // Ambil nilai yang ada jika tidak disediakan
      );
    }
    */

    // Jika Anda ingin mengembalikan data RSVP yang diperbarui juga,
    // Anda harus melakukan SELECT ulang atau JOIN serupa dengan GET.
    // Untuk kemudahan, kita asumsikan frontend akan memanggil refetchGuests
    // yang akan mendapatkan data terbaru.
    return NextResponse.json({ success: true, guest: result.rows[0] });
  } catch (error) {
    console.error("Error updating guest:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update guest due to server error." },
      { status: 500 }
    );
  }
}

// --- DELETE Request: Hapus tamu ---
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, personalize_id } = body;

    const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();
    if (
      !authorizedPersonalizeId ||
      authorizedPersonalizeId !== personalize_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized operation or invalid personalize ID.",
        },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Guest ID is required for deletion." },
        { status: 400 }
      );
    }

    // Penting: Jika ada foreign key constraint, Anda mungkin perlu
    // menghapus entri di rsvp_responses terlebih dahulu atau memiliki
    // CASCADE DELETE di foreign key constraint Anda.
    // Contoh DELETE rsvp_responses:
    await pool.query("DELETE FROM rsvp_responses WHERE guest_id = $1", [id]); // Hapus RSVP terkait dulu

    const result = await pool.query(
      "DELETE FROM guests WHERE id = $1 AND personalize_id = $2 RETURNING id",
      [id, personalize_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Guest not found or unauthorized to delete this guest.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Guest deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete guest due to server error." },
      { status: 500 }
    );
  }
}
