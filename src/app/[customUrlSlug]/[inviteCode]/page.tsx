"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface GuestData {
  id: string;
  name: string;
  invite_code: string;
  address: string | null;
  invitation_type: string;
}

interface PersonalizeData {
  personalize_id: string;
  groom_name: string;
  groom_ig: string | null;
  bride_name: string;
  bride_ig: string | null;
  groom_parents: string | null;
  bride_parents: string | null;
  akad_location: string | null;
  akad_map: string | null;
  akad_datetime: string | null;
  resepsi_location: string | null;
  resepsi_map: string | null;
  resepsi_datetime: string | null;
  website_title: string | null;
  custom_url: string | null;
  bank1_name: string | null;
  bank1_account_name: string | null;
  bank1_account_number: string | null;
  bank2_name: string | null;
  bank2_account_name: string | null;
  bank2_account_number: string | null;
  heroImage: string | null;
  groomImage: string | null;
  brideImage: string | null;
  galleryImages: string[] | null;
  guest: GuestData;
}

export default function InvitationPage() {
  const { customUrlSlug, inviteCode } = useParams<{
    customUrlSlug: string;
    inviteCode: string;
  }>();

  const [data, setData] = useState<PersonalizeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customUrlSlug || !inviteCode) {
      setError("URL undangan tidak lengkap.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/${customUrlSlug}/${inviteCode}`);
        if (!res.ok) throw new Error("Data undangan tidak ditemukan.");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message, {
          position: "top-center",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customUrlSlug, inviteCode]);

  const formatDateTime = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImagePath = (path: string | null, fallback: string) =>
    path?.startsWith("/") ? path : fallback;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>Memuat undangan...</p>
      </div>
    );

  if (error || !data)
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4 text-red-600 bg-red-50">
        <p>{error || "Data undangan tidak tersedia."}</p>
      </div>
    );

  const {
    groom_name,
    groom_ig,
    bride_name,
    bride_ig,
    groom_parents,
    bride_parents,
    akad_location,
    akad_map,
    akad_datetime,
    resepsi_location,
    resepsi_map,
    resepsi_datetime,
    website_title,
    heroImage,
    groomImage,
    brideImage,
    galleryImages,
    bank1_name,
    bank1_account_name,
    bank1_account_number,
    bank2_name,
    bank2_account_name,
    bank2_account_number,
    guest,
  } = data;

  return (
    <div className="min-h-screen font-serif bg-white text-gray-800">
      <ToastContainer />

      {/* Hero */}
      <section
        className="h-screen flex items-center justify-center relative bg-cover bg-center"
        style={{
          backgroundImage: `url(${getImagePath(
            heroImage,
            "/default-hero.jpg"
          )})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="relative z-10 text-center px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            {groom_name} & {bride_name}
          </h1>
          <p className="text-lg mb-4 italic">{website_title}</p>
          <p className="mt-6 text-xl font-light animate-pulse">
            Kepada Yth. Bapak/Ibu/Saudara/i:{" "}
            <span className="font-semibold text-pink-200">{guest.name}</span>
          </p>
          <button
            onClick={() =>
              document
                .getElementById("main-content")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-8 px-6 py-3 bg-white text-gray-800 rounded-full shadow hover:scale-105 transition"
          >
            Buka Undangan <i className="ri-arrow-down-line ml-1"></i>
          </button>
        </div>
      </section>

      <main
        id="main-content"
        className="px-4 md:px-12 py-16 bg-gradient-to-b from-white to-pink-50"
      >
        {/* Couple */}
        <section className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mempelai</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div>
              <img
                src={getImagePath(groomImage, "/default-groom.jpg")}
                className="w-40 h-40 object-cover rounded-full border-4 border-gray-300 mb-2 mx-auto"
              />
              <h3 className="text-xl font-semibold">{groom_name}</h3>
              <p className="text-sm">{groom_parents}</p>
              {groom_ig && (
                <a
                  href={`https://instagram.com/${groom_ig}`}
                  target="_blank"
                  className="text-blue-500 text-sm"
                >
                  @{groom_ig}
                </a>
              )}
            </div>
            <div className="text-4xl text-pink-400 font-bold">&</div>
            <div>
              <img
                src={getImagePath(brideImage, "/default-bride.jpg")}
                className="w-40 h-40 object-cover rounded-full border-4 border-gray-300 mb-2 mx-auto"
              />
              <h3 className="text-xl font-semibold">{bride_name}</h3>
              <p className="text-sm">{bride_parents}</p>
              {bride_ig && (
                <a
                  href={`https://instagram.com/${bride_ig}`}
                  target="_blank"
                  className="text-blue-500 text-sm"
                >
                  @{bride_ig}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Jadwal */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Jadwal Acara</h2>
          {akad_location && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-pink-600">
                Akad Nikah
              </h3>
              <p>{akad_location}</p>
              {akad_datetime && <p>{formatDateTime(akad_datetime)}</p>}
            </div>
          )}
          {resepsi_location && (
            <div>
              <h3 className="text-xl font-semibold text-pink-600">Resepsi</h3>
              <p>{resepsi_location}</p>
              {resepsi_datetime && <p>{formatDateTime(resepsi_datetime)}</p>}
            </div>
          )}
        </section>

        {/* Galeri */}
        {galleryImages && galleryImages.length > 0 && (
          <section className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Galeri Kami</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.map((img, i) => (
                <img
                  key={i}
                  src={getImagePath(img, "/default-gallery.jpg")}
                  className="w-full h-48 object-cover rounded-lg shadow hover:scale-105 transition"
                  alt={`Galeri ${i + 1}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Hadiah */}
        {(bank1_name || bank2_name) && (
          <section className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Wedding Gift</h2>
            <p className="text-gray-600 mb-6">
              Doa restu Anda adalah hadiah terbaik. Jika ingin memberi hadiah,
              silakan transfer ke rekening berikut:
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              {[1, 2].map((num) => {
                const name = num === 1 ? bank1_name : bank2_name;
                const accName =
                  num === 1 ? bank1_account_name : bank2_account_name;
                const accNum =
                  num === 1 ? bank1_account_number : bank2_account_number;
                return (
                  name && (
                    <div
                      key={num}
                      className="bg-white shadow-md rounded-lg p-6 border w-full md:w-80"
                    >
                      <h3 className="text-xl font-semibold">{name}</h3>
                      <p className="text-sm">A.N: {accName}</p>
                      <p className="text-lg font-bold mt-2">{accNum}</p>
                      <button
                        className="mt-2 text-blue-600 text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(accNum || "");
                          toast.info("Nomor rekening disalin!");
                        }}
                      >
                        <i className="ri-file-copy-line"></i> Salin Nomor
                      </button>
                    </div>
                  )
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 border-t py-4">
        <p>
          © {new Date().getFullYear()} {website_title}. All rights reserved.
        </p>
        <p className="text-xs mt-1">Made with ❤️ by Wedding App</p>
      </footer>
    </div>
  );
}
