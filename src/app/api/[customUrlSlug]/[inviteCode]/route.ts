// src/app/api/[customUrlSlug]/[inviteCode]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: any // ✅ Gunakan 'any' atau biarkan tanpa tipe eksplisit agar valid di Vercel
) {
  const { customUrlSlug, inviteCode } = params;

  if (!customUrlSlug || !inviteCode) {
    return NextResponse.json(
      {
        message:
          "URL tidak lengkap. Nama mempelai dan kode undangan diperlukan.",
      },
      { status: 400 }
    );
  }

  try {
    const personalizeResult = await pool.query(
      `SELECT
        id AS personalize_id,
        groom_name,
        ig_groom AS groom_ig,
        bride_name,
        ig_bride AS bride_ig,
        groom_parents,
        bride_parents,
        akad_location,
        akad_map,
        akad_datetime,
        resepsi_location,
        resepsi_map,
        resepsi_datetime,
        website_title,
        custom_url,
        bank1_name,
        bank1_account_name,
        bank1_account_number,
        bank2_name,
        bank2_account_name,
        bank2_account_number,
        hero_image_url,
        groom_image_url,
        bride_image_url,
        gallery_image_urls
      FROM personalize
      WHERE custom_url = $1`,
      [customUrlSlug]
    );

    if (personalizeResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Undangan tidak ditemukan." },
        { status: 404 }
      );
    }

    const p = personalizeResult.rows[0];

    const guestResult = await pool.query(
      `SELECT id, name, code AS invite_code, address, invitation_type
       FROM guests
       WHERE code = $1 AND personalize_id = $2`,
      [inviteCode, p.personalize_id]
    );

    if (guestResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Tamu tidak ditemukan." },
        { status: 404 }
      );
    }

    const g = guestResult.rows[0];

    return NextResponse.json({
      personalize_id: p.personalize_id,
      groom_name: p.groom_name,
      groom_ig: p.groom_ig,
      bride_name: p.bride_name,
      bride_ig: p.bride_ig,
      groom_parents: p.groom_parents,
      bride_parents: p.bride_parents,
      akad_location: p.akad_location,
      akad_map: p.akad_map,
      akad_datetime:
        p.akad_datetime instanceof Date
          ? p.akad_datetime.toISOString()
          : p.akad_datetime,
      resepsi_location: p.resepsi_location,
      resepsi_map: p.resepsi_map,
      resepsi_datetime:
        p.resepsi_datetime instanceof Date
          ? p.resepsi_datetime.toISOString()
          : p.resepsi_datetime,
      website_title: p.website_title,
      custom_url: p.custom_url,
      bank1_name: p.bank1_name,
      bank1_account_name: p.bank1_account_name,
      bank1_account_number: p.bank1_account_number,
      bank2_name: p.bank2_name,
      bank2_account_name: p.bank2_account_name,
      bank2_account_number: p.bank2_account_number,
      heroImage: p.hero_image_url,
      groomImage: p.groom_image_url,
      brideImage: p.bride_image_url,
      galleryImages: p.gallery_image_urls,
      guest: {
        id: g.id,
        name: g.name,
        invite_code: g.invite_code,
        address: g.address,
        invitation_type: g.invitation_type,
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat memuat undangan." },
      { status: 500 }
    );
  }
}
