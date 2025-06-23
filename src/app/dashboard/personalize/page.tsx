"use client";

import { useState } from "react";
import Image from "next/image";

export default function PersonalizePage() {
  const [form, setForm] = useState({
    groomName: "",
    brideName: "",
    groomParents: "",
    brideParents: "",
    akadLocation: "",
    akadDateTime: "",
    resepsiLocation: "",
    resepsiDateTime: "",
    websiteTitle: "",
    customUrl: "",
  });

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [groomImage, setGroomImage] = useState<File | null>(null);
  const [brideImage, setBrideImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmitForm1 = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data mempelai & acara disimpan:", {
      groomName: form.groomName,
      brideName: form.brideName,
      groomParents: form.groomParents,
      brideParents: form.brideParents,
      akadLocation: form.akadLocation,
      akadDateTime: form.akadDateTime,
      resepsiLocation: form.resepsiLocation,
      resepsiDateTime: form.resepsiDateTime,
    });
  };

  const handleSubmitForm2 = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data website disimpan:", {
      websiteTitle: form.websiteTitle,
      customUrl: form.customUrl,
      heroImage,
      groomImage,
      brideImage,
      galleryImages,
    });
  };

  const renderUploadBox = (
    image: File | null,
    onUpload: (file: File) => void,
    onRemove: () => void
  ) => {
    return image ? (
      <div className="relative w-full aspect-video bg-gray-100 rounded overflow-hidden">
        <Image
          src={URL.createObjectURL(image)}
          alt="Preview"
          layout="fill"
          objectFit="cover"
        />
        <button
          type="button"
          className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow"
          onClick={onRemove}
        >
          <i className="ri-close-line text-lg" />
        </button>
      </div>
    ) : (
      <label className="flex items-center justify-center w-full aspect-video border border-dashed border-gray-300 rounded cursor-pointer bg-gray-50 text-gray-400 text-sm hover:bg-gray-100">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <i className="ri-image-add-line text-2xl mb-1" />
          <span>Upload Gambar</span>
        </div>
      </label>
    );
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (galleryImages.length + files.length > 10) {
      alert("Maksimal 10 foto di galeri.");
      return;
    }
    setGalleryImages((prev) => [...prev, ...files]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 space-y-6">
      <h1 className="text-lg font-semibold">Let's get started</h1>

      {/* Form 1: Data Mempelai & Acara */}
      <form
        onSubmit={handleSubmitForm1}
        className="bg-white p-4 rounded shadow-sm text-sm font-normal space-y-6"
      >
        <h2 className="text-lg font-semibold border-b pb-2">
          Data Mempelai & Acara
        </h2>

        {/* Nama Mempelai */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
            Nama Mempelai
          </label>
          <input
            type="text"
            name="groomName"
            value={form.groomName}
            onChange={handleChange}
            placeholder="Mempelai pria"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <input
            type="text"
            name="brideName"
            value={form.brideName}
            onChange={handleChange}
            placeholder="Mempelai wanita"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
        </div>

        {/* Orang Tua */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
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
          <label className="block mb-1 text-gray-700 font-semibold">
            Tempat & Tanggal Akad
          </label>
          <input
            type="text"
            name="akadLocation"
            value={form.akadLocation}
            onChange={handleChange}
            placeholder="Contoh: Masjid Agung"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <div className="relative w-full mb-3">
            <input
              type="datetime-local"
              name="akadDateTime"
              value={form.akadDateTime}
              onChange={handleChange}
              className="w-full border-b border-gray-300 p-1 pr-10 bg-transparent text-base"
            />
            <i className="ri-calendar-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
          </div>
        </div>

        {/* Resepsi */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
            Tempat & Tanggal Resepsi
          </label>
          <input
            type="text"
            name="resepsiLocation"
            value={form.resepsiLocation}
            onChange={handleChange}
            placeholder="Contoh: Gedung Graha"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent"
          />
          <div className="relative w-full mb-3">
            <input
              type="datetime-local"
              name="resepsiDateTime"
              value={form.resepsiDateTime}
              onChange={handleChange}
              className="w-full border-b border-gray-300 p-1 pr-10 bg-transparent"
            />
            <i className="ri-calendar-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded shadow text-sm"
        >
          Simpan
        </button>
      </form>

      {/* Form 2: Website Setting */}
      <form
        onSubmit={handleSubmitForm2}
        className="bg-white p-4 rounded shadow-sm text-sm font-normal space-y-6"
      >
        <h2 className="text-lg font-semibold border-b pb-2">Website Setting</h2>

        {/* Website Title & Custom URL */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
            Nama Panggilan ke-dua Mempelai
          </label>
          <input
            type="text"
            name="websiteTitle"
            value={form.websiteTitle}
            onChange={handleChange}
            placeholder="Contoh: Alwi, Kia"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan tanda koma (,) sebagai pemisah.
          </p>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
            Custom URL
          </label>
          <input
            type="text"
            name="customUrl"
            value={form.customUrl}
            onChange={handleChange}
            placeholder="Contoh: alwi-kia"
            className="w-full mb-1 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Domain: https://undanganmu.com/alwi-kia
          </p>
        </div>

        {/* Hero Image */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
            Hero Image
          </label>
          {renderUploadBox(
            heroImage,
            (file) => setHeroImage(file),
            () => setHeroImage(null)
          )}
        </div>

        {/* Foto Mempelai */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
            Foto Kedua Mempelai
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {renderUploadBox(
                groomImage,
                (file) => setGroomImage(file),
                () => setGroomImage(null)
              )}
              <p className="text-xs text-gray-500 mt-1">
                Unggah foto mempelai pria.
              </p>
            </div>
            <div>
              {renderUploadBox(
                brideImage,
                (file) => setBrideImage(file),
                () => setBrideImage(null)
              )}
              <p className="text-xs text-gray-500 mt-1">
                Unggah foto mempelai wanita.
              </p>
            </div>
          </div>
        </div>

        {/* Galeri Foto */}
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">
            Galeri Foto (maksimal 10)
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* Tombol tambah selalu di awal */}
            {galleryImages.length < 10 && (
              <label className="flex items-center justify-center aspect-square border border-dashed border-gray-300 rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <i className="ri-image-add-line text-2xl text-gray-400" />
              </label>
            )}

            {/* Gambar galeri */}
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded overflow-hidden"
              >
                <Image
                  src={URL.createObjectURL(img)}
                  alt={`Gallery ${index}`}
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded shadow text-sm"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
