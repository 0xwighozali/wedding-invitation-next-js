import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // Asumsi ini adalah connection pool PostgreSQL Anda
import fs from "fs/promises"; // Node.js API untuk sistem file berbasis Promise
import path from "path"; // Modul path Node.js
import { cookies } from "next/headers"; // Untuk membaca cookie dari request
import jwt from "jsonwebtoken"; // Untuk memverifikasi JWT

// Definisikan interface untuk data yang masuk
interface PersonalizeData {
  personalizeId: string; // <-- Ini akan datang dari frontend, tapi kita juga validasi dari token
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
  heroImage: string; // Ini URL hero image BARU (bisa juga URL lama jika tidak berubah)
  groomImage: string; // Ini URL groom image BARU
  brideImage: string; // Ini URL bride image BARU
  galleryImages: string[]; // Ini array URL gallery image BARU
  bank1Name: string;
  bank1AccountName: string;
  bank1AccountNumber: string;
  bank2Name: string;
  bank2AccountName: string;
  bank2AccountNumber: string;
}

// --- Fungsi bantu untuk mendapatkan personalizeId dari token sesi ---
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
    return decoded.personalizeId; // Ambil personalizeId dari token
  } catch (error) {
    console.error("Failed to verify auth token for personalize API:", error);
    return null;
  }
};

// --- Fungsi bantu untuk menghapus file dari direktori unggahan ---
async function deleteFileFromServer(fileUrl: string) {
  // Hanya hapus file yang dikelola oleh API unggahan kita
  if (!fileUrl || !fileUrl.startsWith("/api/uploads/")) {
    console.warn(
      `[DELETE_FILE] Melewati penghapusan untuk URL non-lokal atau tidak valid: ${fileUrl}`
    );
    return;
  }

  const filename = path.basename(fileUrl); // Dapatkan nama file dari URL
  const uploadDir = path.join(process.cwd(), "uploads"); // Root proyek Anda + 'uploads'
  const filePath = path.join(uploadDir, filename);

  try {
    await fs.access(filePath); // Periksa apakah file ada
    await fs.unlink(filePath); // Hapus file
    console.log(`[DELETE_FILE] File lama berhasil dihapus: ${filePath}`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(
        `[DELETE_FILE] File tidak ditemukan, melewati penghapusan: ${filePath}`
      );
    } else {
      console.error(
        `[DELETE_FILE] Error saat menghapus file ${filePath}:`,
        error
      );
    }
  }
}

// --- GET Request: Ambil data personalisasi berdasarkan ID dari sesi ---
export async function GET(req: NextRequest) {
  const personalizeIdFromQuery = req.nextUrl.searchParams.get("id"); // ID yang diminta dari frontend

  // 1. Dapatkan personalizeId yang sah dari token sesi
  const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();

  if (!authorizedPersonalizeId) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diotorisasi. Silakan login." },
      { status: 401 } // Unauthorized
    );
  }

  // 2. Validasi: Pastikan ID yang diminta di query parameter cocok dengan ID di token
  if (
    !personalizeIdFromQuery ||
    authorizedPersonalizeId !== personalizeIdFromQuery
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "ID personalisasi tidak valid atau tidak diotorisasi.",
      },
      { status: 403 } // Forbidden
    );
  }

  try {
    const result = await pool.query(
      `SELECT * FROM personalize WHERE id = $1`,
      [authorizedPersonalizeId] // Gunakan ID yang terotorisasi
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data personalisasi tidak ditemukan untuk pengguna ini.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("GET /api/personalize error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data personalisasi." },
      { status: 500 }
    );
  }
}

// --- PUT Request: Update data personalisasi ---
export async function PUT(req: Request) {
  try {
    const payload: PersonalizeData = await req.json();

    console.log("[API PUT] Payload diterima:", payload);

    const {
      personalizeId, // <-- personalizeId dari body request
      heroImage,
      groomImage,
      brideImage,
      galleryImages,
      // ... properti lainnya dari payload
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

    // 1. Dapatkan personalizeId yang sah dari token sesi
    const authorizedPersonalizeId = await getPersonalizeIdFromAuthToken();

    if (!authorizedPersonalizeId) {
      return NextResponse.json(
        { success: false, message: "Akses tidak diotorisasi. Silakan login." },
        { status: 401 }
      );
    }

    // 2. Validasi: Pastikan personalizeId dari payload cocok dengan ID di token
    if (!personalizeId || authorizedPersonalizeId !== personalizeId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ID personalisasi tidak valid atau tidak diotorisasi untuk diupdate.",
        },
        { status: 403 }
      );
    }

    // 3. Ambil data asli (lama) untuk membandingkan URL gambar
    const originalDataResult = await pool.query(
      `SELECT hero_image_url, groom_image_url, bride_image_url, gallery_image_urls, custom_url
       FROM personalize WHERE id = $1`,
      [authorizedPersonalizeId] // Gunakan ID yang terotorisasi
    );

    const originalData = originalDataResult.rows[0];

    if (!originalData) {
      console.error(
        "[API PUT] Data asli tidak ditemukan untuk personalizeId:",
        authorizedPersonalizeId
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Personalize ID tidak ditemukan atau tidak cocok dengan pengguna.",
        },
        { status: 404 }
      );
    }

    // 4. Validasi custom_url uniqueness (jika custom_url diubah)
    // Hindari error jika custom_url tidak berubah tapi sudah ada di entri sendiri
    if (customUrl && customUrl !== originalData.custom_url) {
      const existingCustomUrl = await pool.query(
        `SELECT id FROM personalize WHERE custom_url = $1 AND id != $2`,
        [customUrl, authorizedPersonalizeId]
      );
      if (existingCustomUrl.rows.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "URL kustom ini sudah digunakan. Silakan pilih yang lain.",
          },
          { status: 409 } // Conflict
        );
      }
    }

    console.log("[API PUT] Data Asli dari DB:", originalData);

    // 5. Tangani gambar tunggal (hero, groom, bride)
    // Hapus jika URL baru berbeda dari yang lama DAN yang lama itu ada
    if (
      originalData.hero_image_url &&
      originalData.hero_image_url !== heroImage
    ) {
      console.log(
        `[API PUT] Gambar Hero berubah. Menghapus yang lama: ${originalData.hero_image_url}`
      );
      await deleteFileFromServer(originalData.hero_image_url);
    } else if (!heroImage && originalData.hero_image_url) {
      // Kasus: Gambar lama ada, tapi di frontend dihapus (URL baru kosong)
      console.log(
        `[API PUT] Gambar Hero dihapus. Menghapus yang lama: ${originalData.hero_image_url}`
      );
      await deleteFileFromServer(originalData.hero_image_url);
    }

    if (
      originalData.groom_image_url &&
      originalData.groom_image_url !== groomImage
    ) {
      console.log(
        `[API PUT] Gambar Groom berubah. Menghapus yang lama: ${originalData.groom_image_url}`
      );
      await deleteFileFromServer(originalData.groom_image_url);
    } else if (!groomImage && originalData.groom_image_url) {
      console.log(
        `[API PUT] Gambar Groom dihapus. Menghapus yang lama: ${originalData.groom_image_url}`
      );
      await deleteFileFromServer(originalData.groom_image_url);
    }

    if (
      originalData.bride_image_url &&
      originalData.bride_image_url !== brideImage
    ) {
      console.log(
        `[API PUT] Gambar Bride berubah. Menghapus yang lama: ${originalData.bride_image_url}`
      );
      await deleteFileFromServer(originalData.bride_image_url);
    } else if (!brideImage && originalData.bride_image_url) {
      console.log(
        `[API PUT] Gambar Bride dihapus. Menghapus yang lama: ${originalData.bride_image_url}`
      );
      await deleteFileFromServer(originalData.bride_image_url);
    }

    // 6. Tangani gambar galeri
    // Pastikan originalGalleryUrls adalah array dan jika null/undefined, inisialisasi sebagai array kosong
    const originalGalleryUrls: string[] = Array.isArray(
      originalData.gallery_image_urls
    )
      ? originalData.gallery_image_urls
      : [];
    const newGalleryUrls: string[] = Array.isArray(galleryImages)
      ? galleryImages
      : [];

    console.log("[API PUT] URL Galeri Asli:", originalGalleryUrls);
    console.log("[API PUT] URL Galeri Baru:", newGalleryUrls);

    // Temukan URL yang ada di galeri asli tetapi TIDAK ada di galeri baru
    const urlsToDelete = originalGalleryUrls.filter(
      (url) => !newGalleryUrls.includes(url)
    );

    console.log("[API PUT] URL Galeri untuk dihapus:", urlsToDelete);

    // Hapus file galeri lama ini secara paralel
    await Promise.all(urlsToDelete.map((url) => deleteFileFromServer(url)));

    // Konversi array URL galeri baru menjadi string JSON untuk kolom JSONB
    const galleryImagesJsonString = JSON.stringify(newGalleryUrls);

    // 7. Lakukan pembaruan database
    await pool.query(
      `UPDATE personalize SET
        groom_name = $1,
        ig_groom = $2,
        bride_name = $3,
        ig_bride = $4,
        groom_parents = $5,
        bride_parents = $6,
        akad_location = $7,
        akad_map = $8,
        akad_datetime = $9,
        resepsi_location = $10,
        resepsi_map = $11,
        resepsi_datetime = $12,
        website_title = $13,
        custom_url = $14,
        hero_image_url = $15,
        groom_image_url = $16,
        bride_image_url = $17,
        gallery_image_urls = $18::jsonb,
        bank1_name = $19,
        bank1_account_name = $20,
        bank1_account_number = $21,
        bank2_name = $22,
        bank2_account_name = $23,
        bank2_account_number = $24,
        updated_at = NOW()
      WHERE id = $25`,
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
        heroImage, // Gunakan URL baru
        groomImage, // Gunakan URL baru
        brideImage, // Gunakan URL baru
        galleryImagesJsonString, // Teruskan string JSON
        bank1Name,
        bank1AccountName,
        bank1AccountNumber,
        bank2Name,
        bank2AccountName,
        bank2AccountNumber,
        authorizedPersonalizeId, // <-- Gunakan ID yang terotorisasi dari token
      ]
    );

    console.log("[API PUT] Pembaruan database berhasil.");
    return NextResponse.json({
      success: true,
      message: "Data berhasil diupdate.",
    });
  } catch (error: any) {
    console.error("[API PUT] Error:", error);
    // Tambahkan penanganan khusus untuk error UNIQUE CONSTRAINT violation pada custom_url
    if (
      error.code === "23505" &&
      error.constraint === "personalize_settings_custom_url_key"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "URL kustom ini sudah digunakan oleh personalisasi lain. Silakan pilih yang unik.",
        },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Gagal update data",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
