import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs"; // Gunakan fs.promises untuk operasi asinkron

// Tentukan direktori unggahan Anda di root proyek
const UPLOAD_DIRECTORY = path.join(process.cwd(), "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Langsung akses params.filename, tidak perlu await
  const filename = params.filename;

  // Pastikan filename tidak kosong atau mencurigakan
  if (!filename || filename.includes("..")) {
    // Basic security check
    return NextResponse.json({ message: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIRECTORY, filename);

  try {
    // Periksa apakah file ada secara asinkron
    await fs.access(filePath, fs.constants.F_OK); // F_OK untuk memeriksa keberadaan file

    const fileBuffer = await fs.readFile(filePath); // Baca file secara asinkron
    const mimeType = getMimeType(filename); // Fungsi helper untuk mendapatkan MIME type

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${filename}"`,
        // Tambahkan Cache-Control untuk caching browser yang lebih baik
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    // Tangani error jika file tidak ditemukan
    if (error.code === "ENOENT") {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }
    console.error("Error serving file:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Fungsi helper untuk mendapatkan MIME type berdasarkan ekstensi file
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".pdf":
      return "application/pdf";
    // Tambahkan lebih banyak tipe jika diperlukan
    default:
      return "application/octet-stream"; // Default untuk tipe tidak dikenal
  }
}
