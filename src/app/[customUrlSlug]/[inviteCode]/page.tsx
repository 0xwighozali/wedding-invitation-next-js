"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineCalendar } from "react-icons/ai"; // Import ikon kalender

// --------------------------------------------------
// Interface TypeScript
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
  heroImage: string | null; // Tidak lagi digunakan untuk background hero utama
  coverImage: string | null;
  groomImage: string | null;
  brideImage: string | null;
  galleryImages: string[] | null;
  bank1_name: string | null;
  bank1_account_name: string | null;
  bank1_account_number: string | null;
  bank2_name: string | null;
  bank2_account_name: string | null;
  bank2_account_number: string | null;
  weddingDate: string | null;
  guest: GuestData;
}

interface UcapanData {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

// --------------------------------------------------
// Komponen Halaman Undangan
export default function InvitationPage() {
  const { customUrlSlug, inviteCode } = useParams<{
    customUrlSlug: string;
    inviteCode: string;
  }>();
  const router = useRouter();

  const [data, setData] = useState<PersonalizeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);

  // State RSVP & Ucapan
  const [rsvpStatus, setRsvpStatus] = useState("hadir");
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);

  const [ucapanName, setUcapanName] = useState("");
  const [ucapanMessage, setUcapanMessage] = useState("");
  const [isUcapanSubmitting, setIsUcapanSubmitting] = useState(false);
  const [ucapanList, setUcapanList] = useState<UcapanData[]>([]);

  // Format tanggal
  const formatDate = (
    iso: string | null,
    options: Intl.DateTimeFormatOptions
  ) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("id-ID", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
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

  // Mendapatkan list ucapan
  const fetchUcapan = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/ucapan/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil daftar ucapan.");
      const json = await res.json();
      setUcapanList(json);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  // Ambil data undangan berdasarkan URL
  useEffect(() => {
    if (!customUrlSlug || !inviteCode) {
      setError("URL undangan tidak lengkap.");
      setLoading(false);
      return;
    }
    (async () => {
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
        if (json.personalize_id) fetchUcapan(json.personalize_id);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [customUrlSlug, inviteCode, fetchUcapan]);

  // Fungsi helper untuk path gambar: utamakan URL lengkap
  const getImagePath = (path: string | null, fallback: string) => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return fallback;
  };

  // Handler RSVP submit
  const handleRsvpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsRsvpSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customUrlSlug,
          inviteCode,
          status: rsvpStatus,
          people_count: peopleCount,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal mengirim RSVP.");
      }
      toast.success("RSVP berhasil dikirim!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsRsvpSubmitting(false);
    }
  };

  // Handler ucapan
  const handleUcapanSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUcapanSubmitting(true);
    if (!ucapanName || !ucapanMessage) {
      toast.error("Nama & ucapan harus diisi.");
      setIsUcapanSubmitting(false);
      return;
    }
    try {
      const res = await fetch(`/api/ucapan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customUrlSlug,
          inviteCode,
          name: ucapanName,
          message: ucapanMessage,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal mengirim ucapan.");
      }
      toast.success("Ucapan berhasil dikirim!");
      setUcapanName("");
      setUcapanMessage("");
      if (data?.personalize_id) fetchUcapan(data.personalize_id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUcapanSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Render loading / error
  if (loading) return <p className="p-8 text-center">Memuat undangan...</p>;
  if (error || !data)
    return (
      <p className="p-8 text-center text-red-600">
        {error || "Data tidak tersedia"}
      </p>
    );

  const {
    groom_name,
    bride_name,
    groom_ig,
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
    coverImage,
    groomImage,
    brideImage,
    galleryImages,
    bank1_name,
    bank1_account_name,
    bank1_account_number,
    bank2_name,
    bank2_account_name,
    bank2_account_number,
    weddingDate,
    guest,
  } = data;

  const openInvitation = () => {
    setIsInvitationOpen(true);
  };

  // --------------------------------------------------
  // Komponen Cover Page (Fullscreen dan Fixed tanpa Card)
  if (!isInvitationOpen) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${getImagePath(
            coverImage || heroImage,
            "/default-cover.jpg"
          )})`,
        }}
      >
        <Head>
          <title>{website_title || `${groom_name} & ${bride_name}`}</title>
          <meta
            name="description"
            content={`Undangan digital ${groom_name} & ${bride_name}`}
          />
        </Head>
        <div className="absolute inset-0 bg-black opacity-60" />
        {/* Konten Cover Page langsung di dalam div utama, tanpa card terpisah */}
        <div className="relative z-10 text-white text-center px-4">
          <p className="text-base font-light mb-1">The Wedding Of</p>
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-16 animate-fade-in">
            {groom_name} & {bride_name}
          </h1>
          <p className="text-lg md:text-xl font-light mb-10">
            Kepada Yth. Bapak/Ibu/Saudara/i: <br />
            <span className="font-semibold text-pink-200">{guest.name}</span>
          </p>
          <button
            onClick={openInvitation}
            className="px-6 py-3 bg-white text-gray-800 shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out text-base font-semibold"
            style={{
              borderTopRightRadius: "20px",
              borderBottomLeftRadius: "20px",
              borderBottomRightRadius: "0",
              borderTopLeftRadius: "0",
            }}
          >
            Buka Undangan <i className="ri-mail-open-line ml-2"></i>
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Komponen Halaman Undangan Utama
  return (
    <div className="font-serif bg-white text-gray-800">
      <Head>
        <title>{website_title || `${groom_name} & ${bride_name}`}</title>
        <meta
          name="description"
          content={`Undangan digital ${groom_name} & ${bride_name}`}
        />
      </Head>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Hero Section: Tanggal Pernikahan */}
      <section className="py-20 text-center bg-pink-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-pink-700 mb-4">
            <AiOutlineCalendar
              className="inline-block mr-2 align-middle"
              size={40}
            />
            {weddingDate &&
              formatDate(weddingDate, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
          </h2>
          <p className="text-xl text-gray-700 italic mb-8">{website_title}</p>
          <p className="text-lg text-gray-800">
            Turut mengundang Bapak/Ibu/Saudara/i:
          </p>
          <p className="text-2xl font-semibold text-pink-600 mt-2">
            {guest.name}
          </p>
          <button
            onClick={() =>
              document
                .getElementById("main-content")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-8 px-6 py-3 bg-pink-600 text-white font-semibold rounded-full shadow hover:bg-pink-700 transition"
          >
            Lihat Detail Acara <i className="ri-arrow-down-line ml-1"></i>
          </button>
        </div>
      </section>

      <main id="main-content" className="px-4 md:px-12 py-16">
        {/* Couple Section */}
        <section className="mb-16 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Mempelai
          </h2>

          {/* Groom Section */}
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
            {/* Foto Groom */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 flex-shrink-0">
              <img
                src={getImagePath(groomImage, "/default-groom.jpg")}
                alt="Groom"
                className="w-full h-full object-cover border-4 border-gray-300"
              />
            </div>

            {/* Data Groom */}
            <div className="text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {groom_name}
              </h3>
              <p className="text-sm text-gray-600">{groom_parents}</p>
              {groom_ig && (
                <a
                  href={`https://instagram.com/${groom_ig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm block mt-1"
                >
                  @{groom_ig}
                </a>
              )}
            </div>
          </div>

          {/* Ikon & */}
          <div className="text-4xl font-bold text-center text-pink-500 mb-12">
            &
          </div>

          {/* Bride Section */}
          <div className="flex flex-row-reverse items-center justify-center gap-4 sm:gap-8">
            {/* Foto Bride */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 flex-shrink-0">
              <img
                src={getImagePath(brideImage, "/default-bride.jpg")}
                alt="Bride"
                className="w-full h-full object-cover border-4 border-gray-300"
              />
            </div>

            {/* Data Bride */}
            <div className="text-right">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {bride_name}
              </h3>
              <p className="text-sm text-gray-600">{bride_parents}</p>
              {bride_ig && (
                <a
                  href={`https://instagram.com/${bride_ig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm block mt-1"
                >
                  @{bride_ig}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section className="text-center mb-16 bg-gray-100 py-12 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Jadwal Acara
          </h2>
          {akad_location && (
            <div className="mb-8 px-6">
              <h3 className="text-xl font-semibold text-pink-600">
                Akad Nikah
              </h3>
              <p className="text-gray-700">{akad_location}</p>
              {akad_datetime && (
                <p className="text-gray-700">{formatDateTime(akad_datetime)}</p>
              )}
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
            <div className="px-6">
              <h3 className="text-xl font-semibold text-pink-600">Resepsi</h3>
              <p className="text-gray-700">{resepsi_location}</p>
              {resepsi_datetime && (
                <p className="text-gray-700">
                  {formatDateTime(resepsi_datetime)}
                </p>
              )}
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

        {/* Modern Gallery Section */}
        {galleryImages && galleryImages.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Galeri Kenangan
            </h2>
            <div className="grid grid-cols-2 gap-0.5">
              {" "}
              {/* Gap sangat kecil */}
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 pb-[150%]"
                >
                  {" "}
                  {/* Rasio 6:9 dan tanpa rounded-lg */}
                  <img
                    src={getImagePath(img, "/default-gallery.jpg")}
                    alt={`Galeri ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gift Section */}
        {(bank1_name || bank2_name) && (
          <section className="text-center mb-16 bg-gray-100 py-12 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Wedding Gift
            </h2>
            <p className="text-gray-600 mb-6">
              Doa restu Anda adalah hadiah terbaik. Jika ingin memberi hadiah,
              silakan transfer ke rekening berikut:
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6 px-4">
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
                placeholder="Contoh: Budi & Keluarga"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                placeholder="Tulis ucapan dan doa terbaik Anda di sini..."
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
