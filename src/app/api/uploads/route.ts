// src/app/api/uploads/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";

// --- BAGIAN INI YANG BERUBAH ---
const UPLOAD_DIRECTORY = path.join(process.cwd(), "uploads"); // Langsung di root proyek, bukan di 'data'
// --- END BAGIAN BERUBAH ---

export async function POST(req: Request) {
  console.log("--- API Upload Request Received ---");

  try {
    console.log("Checking upload directory:", UPLOAD_DIRECTORY);
    if (!existsSync(UPLOAD_DIRECTORY)) {
      console.log("Upload directory does not exist. Creating...");
      await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
      console.log("Upload directory created.");
    } else {
      console.log("Upload directory already exists.");
    }

    const formData = await req.formData();
    console.log("FormData received:", Array.from(formData.keys()));

    const file = formData.get("file") as File;

    if (!file) {
      console.error('No file found in formData with name "file".');
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    console.log(
      "File found:",
      file.name,
      "size:",
      file.size,
      "type:",
      file.type
    );

    const originalFilename = file.name;
    const fileExtension = path.extname(originalFilename);
    const uniqueFilename = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIRECTORY, uniqueFilename);
    console.log("Saving file to:", filePath);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    console.log("File saved successfully!");

    // URL untuk mengakses file jika Anda ingin menyajikannya melalui API
    const fileUrl = `/api/uploads/${uniqueFilename}`;
    console.log("Generated file URL:", fileUrl);

    return NextResponse.json(
      { success: true, url: fileUrl, message: "File uploaded successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Catch block: File upload error:", error);
    return NextResponse.json(
      { success: false, message: "File upload failed.", error: error.message },
      { status: 500 }
    );
  } finally {
    console.log("--- API Upload Request Finished ---");
  }
}
