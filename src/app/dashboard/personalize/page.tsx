"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

// Dynamic import untuk komponen sisi klien agar tidak bermasalah dengan SSR (Server-Side Rendering)
const ClientOnly = dynamic(() => import("@/components/ClientOnly"), {
  ssr: false,
});

// Pilihan untuk pemilihan bank
const bankOptions = [
  { value: "bca", label: "BCA" },
  { value: "bri", label: "BRI" },
  { value: "bni", label: "BNI" },
  { value: "mandiri", label: "Mandiri" },
  { value: "btn", label: "BTN" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "danamon", label: "Danamon" },
  { value: "permata", label: "Permata" },
  { value: "muamalat", label: "Muamalat" },
];

// --- Fungsi helper untuk memuat URL gambar menjadi objek File ---
const loadImageAsFile = async (
  url: string,
  filename: string
): Promise<File | null> => {
  try {
    if (!url) return null;
    const absoluteUrl = url.startsWith("/")
      ? `${window.location.origin}${url}`
      : url;
    const response = await fetch(absoluteUrl);
    if (!response.ok) {
      console.warn(`Gagal mengambil gambar ${absoluteUrl}: ${response.status}`);
      return null;
    }
    const blob = await response.blob();
    const fileExtension = url.split(".").pop()?.split("?")[0] || "jpg";
    const uniqueFilename = `${
      filename.split(".")[0]
    }_${Date.now()}.${fileExtension}`;
    return new File([blob], uniqueFilename, { type: blob.type });
  } catch (err) {
    console.error(`Error saat memuat gambar ${url}:`, err);
    return null;
  }
};

// --- DEFINISI INTERFACE UNTUK STATE FORMULIR ---
interface PersonalizationFormState {
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
  bank1Name: string;
  bank1AccountName: string;
  bank1AccountNumber: string;
  bank2Name: string;
  bank2AccountName: string;
  bank2AccountNumber: string;
  hero_image_url: string;
  groom_image_url: string;
  bride_image_url: string;
  gallery_image_urls: string[];
}

export default function PersonalizePage() {
  const router = useRouter();
  // State untuk menyimpan semua data formulir (dengan tipe eksplisit)
  const [form, setForm] = useState<PersonalizationFormState>({
    personalizeId: "", // Pastikan ada nilai awal
    groomName: "",
    groomIg: "",
    brideName: "",
    brideIg: "",
    groomParents: "",
    brideParents: "",
    akadLocation: "",
    akadMap: "",
    akadDateTime: "",
    resepsiLocation: "",
    resepsiMap: "",
    resepsiDateTime: "",
    websiteTitle: "",
    customUrl: "",
    bank1Name: "",
    bank1AccountName: "",
    bank1AccountNumber: "",
    bank2Name: "",
    bank2AccountName: "",
    bank2AccountNumber: "",
    hero_image_url: "",
    groom_image_url: "",
    bride_image_url: "",
    gallery_image_urls: [],
  });

  // State untuk file gambar (untuk pratinjau dan potensi unggahan)
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [groomImage, setGroomImage] = useState<File | null>(null);
  const [brideImage, setBrideImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  // State loading untuk pengambilan data awal
  const [isLoading, setIsLoading] = useState(true);

  // --- Hook Effect untuk Mengambil Data Awal & Sesi ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Mulai loading
      try {
        // 1. Ambil personalizeId dari sesi
        const resSession = await fetch("/api/auth/session");
        const sessionData = await resSession.json();

        if (
          !resSession.ok ||
          !sessionData.isAuthenticated ||
          !sessionData.user.personalizeId
        ) {
          toast.error("Sesi tidak valid. Silakan login ulang.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
          router.push("/login");
          return;
        }

        const personalizeIdFromSession = sessionData.user.personalizeId;

        // 2. Ambil data personalisasi dengan personalizeId dari sesi
        const res = await fetch(
          `/api/personalize?id=${personalizeIdFromSession}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          console.error(
            `Gagal mengambil data: ${res.status} ${res.statusText}`,
            errorData
          );
          toast.error(
            `Error saat memuat data: ${
              errorData.message || "Error tidak diketahui"
            }`
          );
          return;
        }

        const json = await res.json();

        if (json.success) {
          setForm((prev) => ({
            ...prev,
            groomName: json.data.groom_name || "",
            groomIg: json.data.ig_groom || "",
            brideName: json.data.bride_name || "",
            brideIg: json.data.ig_bride || "",
            groomParents: json.data.groom_parents || "",
            brideParents: json.data.bride_parents || "",
            akadLocation: json.data.akad_location || "",
            akadMap: json.data.akad_map || "",
            akadDateTime: json.data.akad_datetime
              ? json.data.akad_datetime.slice(0, 16)
              : "",
            resepsiLocation: json.data.resepsi_location || "",
            resepsiMap: json.data.resepsi_map || "",
            resepsiDateTime: json.data.resepsi_datetime
              ? json.data.resepsi_datetime.slice(0, 16)
              : "",
            websiteTitle: json.data.website_title || "",
            customUrl: json.data.custom_url || "",
            bank1Name: json.data.bank1_name || "",
            bank1AccountName: json.data.bank1_account_name || "",
            bank1AccountNumber: json.data.bank1_account_number || "",
            bank2Name: json.data.bank2_name || "",
            bank2AccountName: json.data.bank2_account_name || "",
            bank2AccountNumber: json.data.bank2_account_number || "",
            hero_image_url: json.data.hero_image_url || "",
            groom_image_url: json.data.groom_image_url || "",
            bride_image_url: json.data.bride_image_url || "",
            gallery_image_urls: json.data.gallery_image_urls || [],
            personalizeId: personalizeIdFromSession, // Simpan ID dari sesi ke state form
          }));

          // Gunakan Promise.all untuk mengambil gambar secara bersamaan
          const [loadedHero, loadedGroom, loadedBride] = await Promise.all([
            loadImageAsFile(json.data.hero_image_url, "hero.jpg"),
            loadImageAsFile(json.data.groom_image_url, "groom.jpg"),
            loadImageAsFile(json.data.bride_image_url, "bride.jpg"),
          ]);

          setHeroImage(loadedHero);
          setGroomImage(loadedGroom);
          setBrideImage(loadedBride);

          if (
            json.data.gallery_image_urls &&
            json.data.gallery_image_urls.length > 0
          ) {
            const loadedGalleryImages = await Promise.all(
              json.data.gallery_image_urls.map(
                async (url: string, index: number) => {
                  const filename =
                    url.split("/").pop() || `gallery_${index}.jpg`;
                  return await loadImageAsFile(url, filename);
                }
              )
            );
            setGalleryImages(loadedGalleryImages.filter(Boolean) as File[]);
          }
        } else {
          console.error("API success: false - Pesan:", json.message);
          toast.error(
            `Error saat memuat data: ${json.message || "Data tidak ditemukan"}`
          );
        }
      } catch (error) {
        console.error(
          "Gagal memuat data personalisasi (kesalahan jaringan atau exception tak tertangani):",
          error
        );
        toast.error(
          "Gagal terhubung ke server atau memuat data. Mohon periksa jaringan Anda dan coba lagi."
        );
      } finally {
        setIsLoading(false); // Akhiri loading
      }
    };

    fetchData();
  }, [router]);

  // --- Penangan untuk Input Formulir ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange =
    (key: "bank1Name" | "bank2Name") => (selected: any) => {
      setForm((prev) => ({ ...prev, [key]: selected?.value || "" }));
    };

  // --- Helper untuk Merender Kotak Unggah Gambar ---
  const renderUploadBox = (
    imageFile: File | null,
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>,
    onRemove: () => void,
    inputId: string // Digunakan untuk ID input unik
  ) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
      }
    };

    const previewSrc = imageFile ? URL.createObjectURL(imageFile) : "";

    return (
      <div className="relative border border-dashed border-gray-300 rounded p-4 flex flex-col items-center justify-center bg-gray-50 aspect-video">
        {imageFile && previewSrc ? (
          <>
            <Image
              src={previewSrc}
              alt="Pratinjau"
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null); // Set file ke null untuk menghapus pratinjau
                onRemove(); // Panggil fungsi onRemove dari parent (jika ada)
              }}
              className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-md"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="cursor-pointer text-gray-500 hover:text-gray-700 flex flex-col items-center"
          >
            <i className="ri-image-add-line text-4xl mb-2" />
            <span className="text-sm">Unggah Gambar</span>
            <input
              id={inputId} // Gunakan ID unik untuk label
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  };

  // --- Penangan untuk Gambar Galeri ---
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Saring objek non-File
    const newFiles = files.filter((file) => file instanceof File);

    if (galleryImages.length + newFiles.length > 10) {
      toast.warn("Maksimal 10 foto di galeri.");
      return;
    }
    setGalleryImages((prev) => [...prev, ...newFiles]);
  };

  const removeGalleryImage = (i: number) =>
    setGalleryImages((prev) => {
      const updatedImages = prev.filter((_, idx) => idx !== i);
      return updatedImages;
    });

  // --- Helper untuk Mengunggah Gambar ke Server ---
  const uploadImageToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      return data.url; // URL gambar di Cloudinary
    } else {
      console.error("Unggahan gagal:", data.message, data.error);
      throw new Error(
        `Gagal upload: ${data.message || "Error tidak diketahui"}`
      );
    }
  };

  // --- Logika Pengiriman Formulir untuk Formulir 1 ---
  const handleSubmitForm1 = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pastikan personalizeId sudah dimuat sebelum submit
    if (!form.personalizeId) {
      toast.error(
        "ID personalisasi belum dimuat. Silakan coba lagi atau muat ulang halaman."
      );
      return;
    }

    try {
      const personalizeId = form.personalizeId; // Ambil ID dari state form yang sudah diisi

      const payload = {
        personalizeId, // Kirim personalizeId yang benar dari sesi
        groomName: form.groomName,
        groomIg: form.groomIg,
        brideName: form.brideName,
        brideIg: form.brideIg,
        groomParents: form.groomParents,
        brideParents: form.brideParents,
        akadLocation: form.akadLocation,
        akadMap: form.akadMap,
        akadDateTime: form.akadDateTime,
        resepsiLocation: form.resepsiLocation,
        resepsiMap: form.resepsiMap,
        resepsiDateTime: form.resepsiDateTime,
        websiteTitle: form.websiteTitle,
        customUrl: form.customUrl,
        bank1Name: form.bank1Name,
        bank1AccountName: form.bank1AccountName,
        bank1AccountNumber: form.bank1AccountNumber,
        bank2Name: form.bank2Name,
        bank2AccountName: form.bank2AccountName,
        bank2AccountNumber: form.bank2AccountNumber,
        // Kirim URL yang sudah ada untuk gambar, mereka tidak akan diperbarui oleh formulir ini
        heroImage: form.hero_image_url,
        groomImage: form.groom_image_url,
        brideImage: form.bride_image_url,
        galleryImages: form.gallery_image_urls, // Gunakan URL dari state form
      };

      const res = await fetch("/api/personalize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Berhasil menyimpan data mempelai & acara!");
      } else {
        toast.error(
          `Gagal menyimpan data: ${data.message || "Error tidak diketahui"}`
        );
      }
    } catch (err) {
      console.error("Error saat mengirimkan Formulir 1:", err);
      toast.error("Gagal menyimpan data mempelai & acara. Silakan coba lagi.");
    }
  };

  // --- Logika Pengiriman Formulir untuk Formulir 2 ---
  const handleSubmitForm2 = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pastikan personalizeId sudah dimuat sebelum submit
    if (!form.personalizeId) {
      toast.error(
        "ID personalisasi belum dimuat. Silakan coba lagi atau muat ulang halaman."
      );
      return;
    }

    try {
      const personalizeId = form.personalizeId; // Ambil ID dari state form yang sudah diisi

      // Tangani Hero Image
      let newHeroUrl = form.hero_image_url; // Default ke URL yang sudah ada
      if (heroImage && heroImage instanceof File) {
        newHeroUrl = await toast.promise(uploadImageToServer(heroImage), {
          pending: "Mengunggah Hero Image...",
          success: "Hero Image berhasil diunggah!",
          error: "Gagal mengunggah Hero Image!",
        });
      } else if (!heroImage && form.hero_image_url) {
        // Jika file dihapus dari pratinjau dan sebelumnya ada URL, set URL menjadi kosong
        newHeroUrl = "";
      }

      // Tangani Groom Image
      let newGroomUrl = form.groom_image_url;
      if (groomImage && groomImage instanceof File) {
        newGroomUrl = await toast.promise(uploadImageToServer(groomImage), {
          pending: "Mengunggah Foto Mempelai Pria...",
          success: "Foto Mempelai Pria berhasil diunggah!",
          error: "Gagal mengunggah Foto Mempelai Pria!",
        });
      } else if (!groomImage && form.groom_image_url) {
        newGroomUrl = "";
      }

      // Tangani Bride Image
      let newBrideUrl = form.bride_image_url;
      if (brideImage && brideImage instanceof File) {
        newBrideUrl = await toast.promise(uploadImageToServer(brideImage), {
          pending: "Mengunggah Foto Mempelai Wanita...",
          success: "Foto Mempelai Wanita berhasil diunggah!",
          error: "Gagal mengunggah Foto Mempelai Wanita!",
        });
      } else if (!brideImage && form.bride_image_url) {
        newBrideUrl = "";
      }

      // Tangani Gallery Images
      const uploadPromises = galleryImages.map(async (img) => {
        // Cek apakah file ini berasal dari URL lama di DB
        const isOriginalFileFromDB = form.gallery_image_urls.some(
          (originalUrl) => {
            const originalFilenameBase = originalUrl
              .split("/")
              .pop()
              ?.split("?")[0]
              .split(".")[0];
            const currentFileBase = img.name.split("_")[0];
            return originalFilenameBase === currentFileBase;
          }
        );

        if (isOriginalFileFromDB) {
          // Ini adalah gambar lama yang dipertahankan, kembalikan URL aslinya dari state form
          // Anda perlu menemukan URL yang cocok dari form.gallery_image_urls
          const originalUrl = form.gallery_image_urls.find((originalUrl) => {
            const originalFilenameBase = originalUrl
              .split("/")
              .pop()
              ?.split("?")[0]
              .split(".")[0];
            const currentFileBase = img.name.split("_")[0];
            return originalFilenameBase === currentFileBase;
          });
          return originalUrl; // Gunakan URL lama
        } else {
          // Ini adalah file baru yang diunggah
          return await toast.promise(uploadImageToServer(img), {
            pending: `Mengunggah gambar galeri ${img.name}...`,
            success: `Gambar ${img.name} berhasil diunggah!`,
            error: `Gagal mengunggah ${img.name}!`,
          });
        }
      });

      // Filter `null` atau `undefined` yang mungkin muncul dari `uploadPromises`
      // Jika ada masalah dengan Promise, itu akan teratasi di `toast.promise`
      const finalGalleryUrls = (await Promise.all(uploadPromises)).filter(
        Boolean
      ) as string[];

      // Buat payload untuk request PUT dengan semua data formulir, termasuk URL baru
      const finalPayload = {
        personalizeId, // Pastikan ini menggunakan personalizeId dari state form
        // Semua field teks dari state formulir
        groomName: form.groomName,
        groomIg: form.groomIg,
        brideName: form.brideName,
        brideIg: form.brideIg,
        groomParents: form.groomParents,
        brideParents: form.brideParents,
        akadLocation: form.akadLocation,
        akadMap: form.akadMap,
        akadDateTime: form.akadDateTime,
        resepsiLocation: form.resepsiLocation,
        resepsiMap: form.resepsiMap,
        resepsiDateTime: form.resepsiDateTime,
        websiteTitle: form.websiteTitle,
        customUrl: form.customUrl,
        bank1Name: form.bank1Name,
        bank1AccountName: form.bank1AccountName,
        bank1AccountNumber: form.bank1AccountNumber,
        bank2Name: form.bank2Name,
        bank2AccountName: form.bank2AccountName,
        bank2AccountNumber: form.bank2AccountNumber,
        // Ganti URL gambar dengan yang baru
        heroImage: newHeroUrl,
        groomImage: newGroomUrl,
        brideImage: newBrideUrl,
        galleryImages: finalGalleryUrls, // Mengirimkan array URL final ke backend
      };

      const res = await fetch("/api/personalize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      const data = await res.json();
      if (data.success) {
        // Perbarui state formulir dengan URL baru setelah unggahan berhasil
        setForm((prev) => ({
          ...prev, // Sebarkan state sebelumnya untuk mempertahankan field lain
          hero_image_url: newHeroUrl,
          groom_image_url: newGroomUrl,
          bride_image_url: newBrideUrl,
          gallery_image_urls: finalGalleryUrls,
        }));
        // Setelah berhasil menyimpan, muat ulang galeri sebagai File objek lagi
        // agar konsisten dengan `galleryImages` state yang selalu berisi File
        const reloadedGalleryFiles = await Promise.all(
          finalGalleryUrls.map(async (url, index) => {
            const filename = url.split("/").pop() || `gallery_${index}.jpg`;
            return await loadImageAsFile(url, filename);
          })
        );
        setGalleryImages(reloadedGalleryFiles.filter(Boolean) as File[]);

        toast.success("Berhasil menyimpan data & gambar!");
      } else {
        toast.error(
          `Gagal menyimpan: ${data.message || "Error tidak diketahui"}`
        );
      }
    } catch (err) {
      console.error("Error saat mengirimkan Formulir 2:", err);
      toast.error("Gagal mengunggah gambar. Coba lagi.");
    }
  };

  // --- Render Status Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  // --- Render Konten Utama Halaman ---
  return (
    <div className="min-h-screen bg-gray-50 p-2 space-y-6">
      <h1 className="text-lg font-semibold">Mari kita mulai</h1>

      {/* Formulir 1: Data Mempelai & Acara */}
      <form
        onSubmit={handleSubmitForm1}
        className="bg-white p-4 rounded shadow-sm text-sm font-normal space-y-6"
      >
        <h2 className="text-lg font-semibold border-b pb-2">
          Data Mempelai & Acara
        </h2>

        {/* Mempelai */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Nama Mempelai Pria
          </label>
          <input
            type="text"
            name="groomName"
            value={form.groomName}
            onChange={handleChange}
            placeholder="Nama lengkap mempelai pria"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1 bg-gray-100 rounded shadow-sm text-base text-gray-600">
              @
            </div>
            <input
              type="text"
              name="groomIg"
              value={form.groomIg}
              onChange={handleChange}
              placeholder="Instagram"
              className="w-full border-b border-gray-300 p-1 bg-transparent text-base"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 mb-2">
            Username instagram mempelai pria
          </p>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Nama Mempelai Wanita
          </label>
          <input
            type="text"
            name="brideName"
            value={form.brideName}
            onChange={handleChange}
            placeholder="Nama lengkap mempelai wanita"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1 bg-gray-100 rounded shadow-sm text-base text-gray-600">
              @
            </div>
            <input
              type="text"
              name="brideIg"
              value={form.brideIg}
              onChange={handleChange}
              placeholder="Instagram"
              className="w-full border-b border-gray-300 p-1 bg-transparent text-base"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 mb-2">
            Username instagram mempelai wanita
          </p>
        </div>

        {/* Orang Tua */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Nama Orang Tua Mempelai
          </label>
          <input
            type="text"
            name="groomParents"
            value={form.groomParents}
            onChange={handleChange}
            placeholder="Bapak/ibu mempelai pria"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <input
            type="text"
            name="brideParents"
            value={form.brideParents}
            onChange={handleChange}
            placeholder="Bapak/ibu mempelai wanita"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
        </div>

        {/* Akad */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Tempat Akad
          </label>
          <input
            type="text"
            name="akadLocation"
            value={form.akadLocation}
            onChange={handleChange}
            placeholder="Contoh: Masjid Agung"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <input
            type="text"
            name="akadMap"
            value={form.akadMap}
            onChange={handleChange}
            placeholder="Link Google Maps (opsional)"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <label className="block mb-1 font-semibold text-gray-700">
            Tanggal & Waktu Akad
          </label>
          <input
            type="datetime-local"
            name="akadDateTime"
            value={form.akadDateTime}
            onChange={handleChange}
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
        </div>

        {/* Resepsi */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Tempat Resepsi
          </label>
          <input
            type="text"
            name="resepsiLocation"
            value={form.resepsiLocation}
            onChange={handleChange}
            placeholder="Contoh: Gedung Graha"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <input
            type="text"
            name="resepsiMap"
            value={form.resepsiMap}
            onChange={handleChange}
            placeholder="Link Google Maps (opsional)"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <label className="block mb-1 font-semibold text-gray-700">
            Tanggal & Waktu Resepsi
          </label>
          <input
            type="datetime-local"
            name="resepsiDateTime"
            value={form.resepsiDateTime}
            onChange={handleChange}
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded shadow text-sm"
        >
          Simpan
        </button>
      </form>

      {/* Formulir 2: Pengaturan Website + Unggahan + Galeri + Hadiah Digital */}
      <form
        onSubmit={handleSubmitForm2}
        className="bg-white p-4 rounded shadow text-sm space-y-6"
      >
        <h2 className="text-lg font-semibold border-b pb-2">
          Pengaturan Website
        </h2>

        {/* Judul Website */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Nama Panggilan ke-dua Mempelai
          </label>
          <input
            type="text"
            name="websiteTitle"
            value={form.websiteTitle}
            onChange={handleChange}
            placeholder="Contoh: Dilan, Milea"
            className="w-full mb-1 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan tanda koma (,) sebagai pemisah.
          </p>
        </div>

        {/* URL */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Custom URL
          </label>
          <input
            type="text"
            name="customUrl"
            value={form.customUrl}
            onChange={handleChange}
            placeholder="Contoh: Dilan-Milea"
            className="w-full mb-1 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Domain: https://undanganmu.com/dilan-milea
          </p>
        </div>

        {/* Bagian Unggah Gambar */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Hero Image
          </label>
          {renderUploadBox(
            heroImage,
            setHeroImage,
            () => {
              setHeroImage(null);
              setForm((prev) => ({ ...prev, hero_image_url: "" })); // Clear URL di form state
            },
            "hero-image-upload"
          )}
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Foto Kedua Mempelai
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {renderUploadBox(
                groomImage,
                setGroomImage,
                () => {
                  setGroomImage(null);
                  setForm((prev) => ({ ...prev, groom_image_url: "" })); // Clear URL di form state
                },
                "groom-image-upload"
              )}
              <p className="text-xs text-gray-500 mt-1">
                *Unggah foto mempelai pria.
              </p>
            </div>
            <div>
              {renderUploadBox(
                brideImage,
                setBrideImage,
                () => {
                  setBrideImage(null);
                  setForm((prev) => ({ ...prev, bride_image_url: "" })); // Clear URL di form state
                },
                "bride-image-upload"
              )}
              <p className="text-xs text-gray-500 mt-1">
                *Unggah foto mempelai wanita.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Galeri Foto (maksimal 10)
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {galleryImages.length < 10 && (
              <label
                htmlFor="gallery-image-upload"
                className="flex items-center justify-center aspect-square border border-dashed border-gray-300 rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <input
                  id="gallery-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <i className="ri-image-add-line text-2xl text-gray-400" />
              </label>
            )}
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded overflow-hidden"
              >
                <Image
                  src={URL.createObjectURL(img)}
                  alt={`Galeri ${index}`}
                  layout="fill"
                  objectFit="cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow"
                  onClick={() => removeGalleryImage(index)}
                >
                  <i className="ri-close-line text-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hadiah Digital */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Hadiah Digital (opsional)
          </label>
          <div className="space-y-4">
            {/* Bank 1 */}
            <div className="bg-white p-4 rounded shadow-sm text-sm font-normal space-y-2">
              <label className="block mb-1">Bank 1</label>
              <ClientOnly>
                <Select
                  placeholder="Pilih Nama Bank 1"
                  options={bankOptions}
                  isSearchable
                  value={
                    bankOptions.find((o) => o.value === form.bank1Name) || null
                  }
                  onChange={handleSelectChange("bank1Name")}
                />
              </ClientOnly>
              <input
                type="text"
                name="bank1AccountName"
                value={form.bank1AccountName}
                onChange={handleChange}
                placeholder="Nama Pemilik Rekening"
                className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent"
              />
              <input
                type="text"
                name="bank1AccountNumber"
                value={form.bank1AccountNumber}
                onChange={handleChange}
                placeholder="Nomor Rekening"
                className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent"
              />
            </div>

            {/* Bank 2 */}
            <div className="bg-white p-4 rounded shadow-sm text-sm font-normal space-y-2">
              <label className="block mb-1">Bank 2</label>
              <ClientOnly>
                <Select
                  placeholder="Pilih Nama Bank 2"
                  options={bankOptions}
                  isSearchable
                  value={
                    bankOptions.find((o) => o.value === form.bank2Name) || null
                  }
                  onChange={handleSelectChange("bank2Name")}
                />
              </ClientOnly>
              <input
                type="text"
                name="bank2AccountName"
                value={form.bank2AccountName}
                onChange={handleChange}
                placeholder="Nama Pemilik Rekening"
                className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent"
              />
              <input
                type="text"
                name="bank2AccountNumber"
                value={form.bank2AccountNumber}
                onChange={handleChange}
                placeholder="Nomor Rekening"
                className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded shadow text-sm"
        >
          Simpan Semua Data & Gambar
        </button>
      </form>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
