"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <section className="bg-gray-900 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold">Undangan Pernikahan Digital</h1>
        <p className="mt-2 text-gray-300 text-lg">
          Tampilan elegan dan profesional untuk momen spesial Anda
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button className="bg-white text-black px-6 py-2 rounded">
            Lihat Tema
          </button>
          <button className="border border-white px-6 py-2 rounded">
            Pesan Sekarang
          </button>
        </div>
      </section>

      {/* Hero */}
      <section className="bg-gray-100 py-10 px-4 flex flex-col items-center">
        <img
          src="https://source.unsplash.com/featured/?wedding"
          alt="Contoh Undangan"
          className="mx-auto rounded-md shadow-lg w-[300px] h-auto"
        />

        <p className="mt-4 max-w-xl text-center text-gray-600">
          Website undangan digital premium, cocok untuk semua jenis pernikahan
          dengan fitur lengkap dan desain yang menawan.
        </p>
      </section>

      {/* Fitur */}
      <section className="py-12 bg-white px-6">
        <h2 className="text-2xl font-bold text-center mb-8">Fitur Unggulan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
          {[
            "Galeri Foto",
            "Ucapan & RSVP",
            "Musik Latar",
            "Hitung Mundur",
            "Google Maps",
            "Custom URL",
            "Statistik Tamu",
            "Share WhatsApp",
          ].map((fitur) => (
            <div key={fitur} className="bg-gray-100 p-4 rounded shadow text-sm">
              {fitur}
            </div>
          ))}
        </div>
      </section>

      {/* Cara Order */}
      <section className="py-12 bg-gray-50 px-6">
        <h2 className="text-xl font-semibold text-center mb-4">
          Cara Pemesanan
        </h2>
        <ol className="max-w-md mx-auto text-gray-700 list-decimal list-inside space-y-2">
          <li>Pilih tema undangan</li>
          <li>Isi formulir data pernikahan</li>
          <li>Lakukan pembayaran</li>
          <li>Website undangan dikirim dalam 1x24 jam</li>
        </ol>
      </section>

      {/* Paket */}
      <section className="py-12 bg-white px-6">
        <h2 className="text-xl font-semibold text-center mb-4">Paket Harga</h2>
        <div className="bg-gray-100 p-6 rounded-md max-w-md mx-auto text-center shadow">
          <h3 className="font-bold text-lg mb-2">Paket Gold</h3>
          <ul className="text-sm text-left list-disc list-inside space-y-1">
            <li>Semua fitur lengkap</li>
            <li>Desain premium</li>
            <li>Edit data 3x</li>
            <li>Custom link</li>
          </ul>
          <div className="mt-4 text-2xl font-bold">Rp 149.000</div>
          <button className="mt-4 bg-black text-white px-6 py-2 rounded">
            Pesan Sekarang
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-900 text-white text-center text-sm">
        © {new Date().getFullYear()} Invite Wedding. All rights reserved.
      </footer>
    </main>
  );
}
