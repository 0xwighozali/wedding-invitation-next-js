"use client";

import { useEffect, useState, FormEvent } from "react";
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

interface UcapanData {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export default function InvitationPage() {
  const { customUrlSlug, inviteCode } = useParams<{
    customUrlSlug: string;
    inviteCode: string;
  }>();

  const [data, setData] = useState<PersonalizeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rsvpStatus, setRsvpStatus] = useState<string>("hadir");
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);

  const [ucapanName, setUcapanName] = useState<string>("");
  const [ucapanMessage, setUcapanMessage] = useState<string>("");
  const [isUcapanSubmitting, setIsUcapanSubmitting] = useState(false);
  const [ucapanList, setUcapanList] = useState<UcapanData[]>([]);

  useEffect(() => {
    if (!customUrlSlug || !inviteCode) {
      setError("URL undangan tidak lengkap.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/${customUrlSlug}/${inviteCode}`);
        if (!res.ok) {
          const errorJson = await res.json();
          throw new Error(
            errorJson.message || "Data undangan tidak ditemukan."
          );
        }
        const json = await res.json();
        setData(json);

        if (json.personalize_id) {
          fetchUcapan(json.personalize_id);
        }
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

  const fetchUcapan = async (personalizeId: string) => {
    try {
      const res = await fetch(`/api/ucapan/${personalizeId}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil daftar ucapan.");
      }
      const json = await res.json();
      setUcapanList(json);
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleRsvpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customUrlSlug || !inviteCode) {
      toast.error("URL undangan tidak lengkap.");
      return;
    }

    setIsRsvpSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customUrlSlug: customUrlSlug,
          inviteCode: inviteCode,
          status: rsvpStatus,
          people_count: peopleCount,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message || "Gagal mengirim RSVP.");
      }

      toast.success("RSVP berhasil dikirim!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsRsvpSubmitting(false);
    }
  };

  const handleUcapanSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ucapanName || !ucapanMessage || !customUrlSlug || !inviteCode) {
      toast.error("Nama, pesan ucapan, kode undangan, dan URL harus diisi.");
      return;
    }

    setIsUcapanSubmitting(true);
    try {
      const res = await fetch(`/api/ucapan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customUrlSlug: customUrlSlug,
          inviteCode: inviteCode,
          name: ucapanName,
          message: ucapanMessage,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message || "Gagal mengirim ucapan.");
      }

      toast.success("Ucapan berhasil dikirim!", {
        position: "top-center",
        autoClose: 3000,
      });
      setUcapanName("");
      setUcapanMessage("");
      if (data?.personalize_id) {
        fetchUcapan(data.personalize_id);
      }
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsUcapanSubmitting(false);
    }
  };

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

      {/* Hero Section */}
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
        {/* Couple Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mempelai</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div>
              <img
                src={getImagePath(groomImage, "/default-groom.jpg")}
                className="w-40 h-40 object-cover rounded-full border-4 border-gray-300 mb-2 mx-auto"
                alt="Groom"
              />
              <h3 className="text-xl font-semibold">{groom_name}</h3>
              <p className="text-sm">{groom_parents}</p>
              {groom_ig && (
                <a
                  href={`https://instagram.com/${groom_ig}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
                alt="Bride"
              />
              <h3 className="text-xl font-semibold">{bride_name}</h3>
              <p className="text-sm">{bride_parents}</p>
              {bride_ig && (
                <a
                  href={`https://instagram.com/${bride_ig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm"
                >
                  @{bride_ig}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Jadwal Acara</h2>
          {akad_location && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-pink-600">
                Akad Nikah
              </h3>
              <p>{akad_location}</p>
              {akad_datetime && <p>{formatDateTime(akad_datetime)}</p>}
              {akad_map && (
                <a
                  href={akad_map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm mt-1 inline-block"
                >
                  Lihat Peta <i className="ri-map-pin-line ml-1"></i>
                </a>
              )}
            </div>
          )}
          {resepsi_location && (
            <div>
              <h3 className="text-xl font-semibold text-pink-600">Resepsi</h3>
              <p>{resepsi_location}</p>
              {resepsi_datetime && <p>{formatDateTime(resepsi_datetime)}</p>}
              {resepsi_map && (
                <a
                  href={resepsi_map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm mt-1 inline-block"
                >
                  Lihat Peta <i className="ri-map-pin-line ml-1"></i>
                </a>
              )}
            </div>
          )}
        </section>

        {/* Gallery Section */}
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

        {/* Gift Section */}
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

        {/* RSVP Section */}
        <section className="text-center mb-16 p-6 bg-pink-100 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-pink-700">
            Konfirmasi Kehadiran (RSVP)
          </h2>
          <p className="mb-4 text-gray-700">
            Mohon konfirmasi kehadiran Anda agar kami dapat mempersiapkan acara
            dengan baik.
          </p>
          <form
            onSubmit={handleRsvpSubmit}
            className="max-w-md mx-auto space-y-4"
          >
            <div>
              <label
                htmlFor="rsvp-status"
                className="block text-left text-gray-700 font-semibold mb-2"
              >
                Status Kehadiran:
              </label>
              <select
                id="rsvp-status"
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                required
              >
                <option value="hadir">Hadir</option>
                <option value="tidak hadir">Tidak Hadir</option>
              </select>
            </div>
            {rsvpStatus === "hadir" && (
              <div>
                <label
                  htmlFor="people-count"
                  className="block text-left text-gray-700 font-semibold mb-2"
                >
                  Jumlah Tamu yang Hadir (termasuk Anda):
                </label>
                <input
                  type="number"
                  id="people-count"
                  value={peopleCount}
                  onChange={(e) =>
                    setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isRsvpSubmitting}
              className="w-full px-6 py-3 bg-pink-600 text-white font-semibold rounded-md shadow hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRsvpSubmitting ? "Mengirim..." : "Kirim RSVP"}
            </button>
          </form>
        </section>

        {/* Ucapan Section */}
        <section className="text-center mb-16 p-6 bg-blue-50 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-blue-700">
            Kirim Doa & Ucapan
          </h2>
          <form
            onSubmit={handleUcapanSubmit}
            className="max-w-lg mx-auto space-y-4"
          >
            <div>
              <label
                htmlFor="ucapan-name"
                className="block text-left text-gray-700 font-semibold mb-2"
              >
                Nama Anda:
              </label>
              <input
                type="text"
                id="ucapan-name"
                value={ucapanName}
                onChange={(e) => setUcapanName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Budi & Keluarga"
                required
              />
            </div>
            <div>
              <label
                htmlFor="ucapan-message"
                className="block text-left text-gray-700 font-semibold mb-2"
              >
                Pesan Anda:
              </label>
              <textarea
                id="ucapan-message"
                value={ucapanMessage}
                onChange={(e) => setUcapanMessage(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tulis ucapan dan doa terbaik Anda di sini..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isUcapanSubmitting}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUcapanSubmitting ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>

          {/* List Ucapan */}
          <div className="mt-10 text-left">
            <h3 className="text-2xl font-bold mb-4 text-blue-700">
              Ucapan dari Tamu Lain:
            </h3>
            {ucapanList.length === 0 ? (
              <p className="text-gray-600">
                Belum ada ucapan. Jadilah yang pertama!
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {ucapanList.map((ucapan) => (
                  <div
                    key={ucapan.id}
                    className="bg-white p-4 rounded-lg shadow border border-gray-200"
                  >
                    <p className="font-semibold text-gray-900">{ucapan.name}</p>
                    <p className="text-gray-700 mt-1 text-sm italic">
                      "{ucapan.message}"
                    </p>
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {new Date(ucapan.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="text-center text-sm text-gray-500 border-t py-4">
        <p>
          © {new Date().getFullYear()} {website_title}. All rights reserved.
        </p>
        <p className="text-xs mt-1">Made with ❤️ by Wedding App</p>
      </footer>
    </div>
  );
}
