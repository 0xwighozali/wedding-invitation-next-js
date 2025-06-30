// src/app/api/guests/route.ts
import { NextResponse } from "next/server";
import sql from "@/lib/db";
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
    return decoded.personalizeId; // <-- Ambil personalizeId dari token
  } catch (error) {
    console.error("Failed to verify auth token:", error);
    return null;
  }
};

// --- GET Request: Ambil semua tamu berdasarkan personalize_id ---
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const personalizeId = searchParams.get("personalize_id"); // Ambil personalize_id dari query param

  // 1. Pastikan personalize_id disediakan oleh klien
  if (!personalizeId) {
    return NextResponse.json(
      {
        success: false,
        error: "personalize_id is required as a query parameter.",
      },
      { status: 400 }
    );
  }

  // 2. Verifikasi otorisasi: Pastikan personalize_id yang diminta cocok dengan yang ada di token
  const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken(); // <-- Gunakan fungsi helper yang baru
  if (!authorizedPersonalizeId || authorizedPersonalizeId !== personalizeId) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized access or invalid personalize ID.",
      },
      { status: 403 } // Forbidden
    );
  }

  try {
    // Query database hanya untuk tamu dengan personalize_id yang sesuai
    const result = await sql.query(
      "SELECT * FROM guests WHERE personalize_id = $1 ORDER BY created_at DESC",
      [personalizeId]
    );
    return NextResponse.json({ success: true, guests: result.rows });
  } catch (error) {
    console.error("Error fetching guests:", error);
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
    const { name, phone, address, invitation_type, personalize_id } = body; // personalize_id dari body

    // 1. Verifikasi otorisasi: Pastikan personalize_id yang dikirim cocok dengan yang ada di token
    const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken(); // <-- Gunakan fungsi helper yang baru
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

    // 2. Validasi input dasar
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
    const invitationCode = `INV-${uuidv4().substring(0, 8).toUpperCase()}`; // Contoh kode undangan

    const result = await sql.query(
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
    } = body;

    // 1. Verifikasi otorisasi
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

    // 2. Validasi ID tamu
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

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Guest not found or unauthorized to update this guest.",
        },
        { status: 404 }
      );
    }

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

    // 1. Verifikasi otorisasi
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

    // 2. Validasi ID tamu
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Guest ID is required for deletion." },
        { status: 400 }
      );
    }

    const result = await sql.query(
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
