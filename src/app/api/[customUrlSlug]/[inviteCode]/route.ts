import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface RouteParams {
  params: {
    customUrlSlug: string;
    inviteCode: string;
  };
}

export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const { customUrlSlug, inviteCode } = context.params;

    if (!customUrlSlug || !inviteCode) {
      return NextResponse.json(
        {
          message:
            "URL tidak lengkap. Nama mempelai (URL kustom) dan kode undangan diperlukan.",
        },
        { status: 400 }
      );
    }

    // Ambil data personalisasi berdasarkan custom_url
    const personalizeResult = await pool.query(
      `
      SELECT
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
      WHERE custom_url = $1
      `,
      [customUrlSlug]
    );

    if (personalizeResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Undangan tidak ditemukan. Periksa kembali URL." },
        { status: 404 }
      );
    }

    const p = personalizeResult.rows[0];

    // Ambil data tamu berdasarkan code dan personalize_id
    const guestResult = await pool.query(
      `
      SELECT
        id,
        name,
        code AS invite_code,
        address,
        invitation_type
      FROM guests
      WHERE code = $1 AND personalize_id = $2
      `,
      [inviteCode, p.personalize_id]
    );

    if (guestResult.rows.length === 0) {
      return NextResponse.json(
        {
          message: "Kode undangan tamu tidak valid untuk undangan ini.",
        },
        { status: 404 }
      );
    }

    const g = guestResult.rows[0];

    // Format ISO string
    const akadDatetime =
      p.akad_datetime instanceof Date
        ? p.akad_datetime.toISOString()
        : p.akad_datetime;

    const resepsiDatetime =
      p.resepsi_datetime instanceof Date
        ? p.resepsi_datetime.toISOString()
        : p.resepsi_datetime;

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
      akad_datetime: akadDatetime,
      resepsi_location: p.resepsi_location,
      resepsi_map: p.resepsi_map,
      resepsi_datetime: resepsiDatetime,
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
    console.error("Error fetching invitation data:", error);

    if (error.code === "42703") {
      return NextResponse.json(
        {
          message: `Database error: Kolom "${error.column}" tidak ditemukan. Periksa kembali query dan skema tabel.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan server saat memuat undangan." },
      { status: 500 }
    );
  }
}
