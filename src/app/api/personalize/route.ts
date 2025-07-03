import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Interface data
interface PersonalizeData {
  personalizeId: string;
  groomName: string;
  groomIg: string;
  brideName: string;
  brideIg: string;
  groomParents: string;
  brideParents: string;
  akadLocation: string;
  akadMap: string;
  akadDateTime: string;
  resepsiLocation: string;
  resepsiMap: string;
  resepsiDateTime: string;
  websiteTitle: string;
  customUrl: string;
  coverImage: string;
  heroImage: string;
  groomImage: string;
  brideImage: string;
  galleryImages: string[];
  bank1Name: string;
  bank1AccountName: string;
  bank1AccountNumber: string;
  bank2Name: string;
  bank2AccountName: string;
  bank2AccountNumber: string;
}

// Ambil personalizeId dari token
const getPersonalizeIdFromAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET_KEY!;
  try {
    const decoded: any = jwt.verify(token, secret);
    return decoded.personalizeId;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};

// Fungsi hapus file dari Cloudinary
async function deleteFileFromCloudinary(fileUrl: string) {
  if (!fileUrl || !fileUrl.includes("cloudinary.com")) return;

  const segments = fileUrl.split("/");
  const filename = segments[segments.length - 1].split(".")[0];
  const folder = segments[segments.length - 2];
  const publicId = `${folder}/${filename}`;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] Deleted: ${publicId}`, result);
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete: ${publicId}`, err);
  }
}

// --- GET handler ---
export async function GET(req: NextRequest) {
  const personalizeIdFromQuery = req.nextUrl.searchParams.get("id");
  const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();

  if (!authorizedPersonalizeId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (authorizedPersonalizeId !== personalizeIdFromQuery) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const result = await pool.query("SELECT * FROM personalize WHERE id = $1", [
      authorizedPersonalizeId,
    ]);
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("GET personalize error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// --- PUT handler ---
// --- PUT handler ---
export async function PUT(req: Request) {
  try {
    const payload: PersonalizeData = await req.json();
    const {
      personalizeId,
      coverImage,
      heroImage,
      groomImage,
      brideImage,
      galleryImages,
      groomName,
      groomIg,
      brideName,
      brideIg,
      groomParents,
      brideParents,
      akadLocation,
      akadMap,
      akadDateTime,
      resepsiLocation,
      resepsiMap,
      resepsiDateTime,
      websiteTitle,
      customUrl,
      bank1Name,
      bank1AccountName,
      bank1AccountNumber,
      bank2Name,
      bank2AccountName,
      bank2AccountNumber,
    } = payload;

    const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();
    if (!authorizedPersonalizeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (authorizedPersonalizeId !== personalizeId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const original = await pool.query(
      `SELECT cover_image_url, hero_image_url, groom_image_url, bride_image_url, gallery_image_urls, custom_url
       FROM personalize WHERE id = $1`,
      [authorizedPersonalizeId]
    );

    const originalData = original.rows[0];
    if (!originalData) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    // Cek jika customUrl berubah
    if (customUrl && customUrl !== originalData.custom_url) {
      const existing = await pool.query(
        `SELECT id FROM personalize WHERE custom_url = $1 AND id != $2`,
        [customUrl, authorizedPersonalizeId]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: "Custom URL already used" },
          { status: 409 }
        );
      }
    }

    // Hapus gambar lama jika diganti
    if (
      originalData.cover_image_url &&
      originalData.cover_image_url !== coverImage
    ) {
      await deleteFileFromCloudinary(originalData.cover_image_url);
    }
    if (
      originalData.hero_image_url &&
      originalData.hero_image_url !== heroImage
    ) {
      await deleteFileFromCloudinary(originalData.hero_image_url);
    }
    if (
      originalData.groom_image_url &&
      originalData.groom_image_url !== groomImage
    ) {
      await deleteFileFromCloudinary(originalData.groom_image_url);
    }
    if (
      originalData.bride_image_url &&
      originalData.bride_image_url !== brideImage
    ) {
      await deleteFileFromCloudinary(originalData.bride_image_url);
    }

    const oldGallery = Array.isArray(originalData.gallery_image_urls)
      ? originalData.gallery_image_urls
      : [];

    const urlsToDelete = oldGallery.filter(
      (url: string) => !galleryImages.includes(url)
    );
    await Promise.all(
      urlsToDelete.map((url: string) => deleteFileFromCloudinary(url))
    );

    const galleryJson = JSON.stringify(galleryImages);

    // Update database
    await pool.query(
      `UPDATE personalize SET
        groom_name = $1, ig_groom = $2, bride_name = $3, ig_bride = $4,
        groom_parents = $5, bride_parents = $6,
        akad_location = $7, akad_map = $8, akad_datetime = $9,
        resepsi_location = $10, resepsi_map = $11, resepsi_datetime = $12,
        website_title = $13, custom_url = $14, cover_image_url = $15,
        hero_image_url = $16, groom_image_url = $17, bride_image_url = $18,
        gallery_image_urls = $19::jsonb,
        bank1_name = $20, bank1_account_name = $21, bank1_account_number = $22,
        bank2_name = $23, bank2_account_name = $24, bank2_account_number = $25,
        updated_at = NOW()
      WHERE id = $26`,
      [
        groomName,
        groomIg,
        brideName,
        brideIg,
        groomParents,
        brideParents,
        akadLocation,
        akadMap,
        akadDateTime,
        resepsiLocation,
        resepsiMap,
        resepsiDateTime,
        websiteTitle,
        customUrl,
        coverImage, // $15
        heroImage,
        groomImage,
        brideImage,
        galleryJson,
        bank1Name,
        bank1AccountName,
        bank1AccountNumber,
        bank2Name,
        bank2AccountName,
        bank2AccountNumber,
        authorizedPersonalizeId, // $26
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error: any) {
    console.error("PUT personalize error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Custom URL must be unique" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update", error: error.message },
      { status: 500 }
    );
  }
}
