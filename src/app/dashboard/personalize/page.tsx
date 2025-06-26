"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Select from "react-select";

const ClientOnly = dynamic(() => import("@/components/ClientOnly"), {
  ssr: false,
});

// gunakan placeholder bankOptions yang sama seperti BankSelect
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

export default function PersonalizePage() {
  const [form, setForm] = useState({
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
  });

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [groomImage, setGroomImage] = useState<File | null>(null);
  const [brideImage, setBrideImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange =
    (key: "bank1Name" | "bank2Name") => (selected: any) => {
      setForm((prev) => ({ ...prev, [key]: selected?.value || "" }));
    };

  const renderUploadBox = (
    image: File | null,
    onUpload: (file: File) => void,
    onRemove: () => void
  ) =>
    image ? (
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
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <i className="ri-image-add-line text-2xl mb-1" />
          <span>Upload Gambar</span>
        </div>
      </label>
    );

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (galleryImages.length + files.length > 10) {
      alert("Maksimal 10 foto di galeri.");
      return;
    }
    setGalleryImages((prev) => [...prev, ...files]);
  };

  const removeGalleryImage = (i: number) =>
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmitForm1 = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data mempelai & acara:", form);
  };

  const handleSubmitForm2 = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data website:", {
      ...form,
      heroImage,
      groomImage,
      brideImage,
      galleryImages,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 space-y-6">
      <h1 className="text-lg font-semibold">Let's get started</h1>

      {/* Form 1: Mempelai */}
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
            placeholder="Mempelai pria"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1 bg-gray-100 rounded shadow-sm text-base text-gray-600">
              @
            </div>
            <input
              type="text"
              name="groomInstagram"
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
            placeholder="Mempelai wanita"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1 bg-gray-100 rounded shadow-sm text-base text-gray-600">
              @
            </div>
            <input
              type="text"
              name="groomInstagram"
              value={form.groomIg}
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

      {/* Form Website Setting + Uploads + Galeri + Digital Gift */}
      <form
        onSubmit={handleSubmitForm2}
        className="bg-white p-4 rounded shadow text-sm space-y-6"
      >
        <h2 className="text-lg font-semibold border-b pb-2">Website Setting</h2>

        {/* Website title */}
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

        {/* Upload Image Section */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Hero Image
          </label>
          {renderUploadBox(heroImage, setHeroImage, () => setHeroImage(null))}
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Foto Kedua Mempelai
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {renderUploadBox(groomImage, setGroomImage, () =>
                setGroomImage(null)
              )}
              <p className="text-xs text-gray-500 mt-1">
                *Unggah foto mempelai pria.
              </p>
            </div>
            <div>
              {renderUploadBox(brideImage, setBrideImage, () =>
                setBrideImage(null)
              )}
              <p className="text-xs text-gray-500 mt-1">
                *Unggah foto mempelai pria.
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

        {/* Digital Gift */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Digital Gift (opsional)
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
                  value={bankOptions.find((o) => o.value === form.bank1Name)}
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
                  value={bankOptions.find((o) => o.value === form.bank2Name)}
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
          className="w-full bg-blue-600 text-white py-2 rounded shadow"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
