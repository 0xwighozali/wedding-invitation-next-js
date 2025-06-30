import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const UPLOAD_DIRECTORY = path.join(process.cwd(), "uploads");

export async function GET(
  request: NextRequest,
  { params }: any // ✅ Hindari typing eksplisit di sini!
) {
  const filename = params.filename;

  if (!filename || filename.includes("..")) {
    return NextResponse.json({ message: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIRECTORY, filename);

  try {
    await fs.access(filePath);
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(filename);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
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
    default:
      return "application/octet-stream";
  }
}
