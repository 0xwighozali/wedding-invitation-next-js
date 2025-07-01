"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  heroImage: string | null;
  groomImage: string | null;
  brideImage: string | null;
  galleryImages: string[] | null;
  bank1_name: string | null;
  bank1_account_name: string | null;
  bank1_account_number: string | null;
  bank2_name: string | null;
  bank2_account_name: string | null;
  bank2_account_number: string | null;
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

  const [data, setData] = useState<PersonalizeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State RSVP & Ucapan
  const [rsvpStatus, setRsvpStatus] = useState("hadir");
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);

  const [ucapanName, setUcapanName] = useState("");
  const [ucapanMessage, setUcapanMessage] = useState("");
  const [isUcapanSubmitting, setIsUcapanSubmitting] = useState(false);
  const [ucapanList, setUcapanList] = useState<UcapanData[]>([]);

  // Format tanggal
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
        if (!res.ok) throw new Error("Data undangan tidak ditemukan.");
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
    <div className="bg-white text-gray-800">
      <Head>
        <title>{website_title || `${groom_name} & ${bride_name}`}</title>
        <meta
          name="description"
          content={`Undangan digital ${groom_name} & ${bride_name}`}
        />
      </Head>
      <ToastContainer />

      {/* Hero */}
      <section
        className="h-screen bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage: `url(${getImagePath(
            heroImage,
            "/default-hero.jpg"
          )})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative text-white text-center px-4">
          <h1 className="text-4xl font-bold">
            {groom_name} & {bride_name}
          </h1>
          {website_title && (
            <p className="italic text-lg mt-2">{website_title}</p>
          )}
          <p className="mt-4 text-xl">
            Kepada Yth. <span className="font-semibold">{guest.name}</span>
          </p>
        </div>
      </section>

      {/* Mempelai */}
      <section className="px-4 py-12 text-center">
        <h2 className="text-3xl font-bold mb-8">Mempelai</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-12">
          {[
            {
              img: groomImage,
              name: groom_name,
              parents: groom_parents,
              ig: groom_ig,
              fallback: "/default-groom.jpg",
            },
            {
              img: brideImage,
              name: bride_name,
              parents: bride_parents,
              ig: bride_ig,
              fallback: "/default-bride.jpg",
            },
          ].map((person, i) => (
            <div key={i} className="text-center">
              <img
                src={getImagePath(person.img, person.fallback)}
                alt={person.name}
                className="w-40 h-40 rounded-full border-4 mx-auto object-cover"
              />
              <h3 className="text-xl font-semibold mt-2">{person.name}</h3>
              {person.parents && <p className="text-sm">{person.parents}</p>}
              {person.ig && (
                <a
                  href={`https://instagram.com/${person.ig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  @{person.ig}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Jadwal */}
      <section className="px-4 py-12 text-center bg-pink-50">
        <h2 className="text-3xl font-bold mb-8">Jadwal Acara</h2>
        {[
          {
            title: "Akad Nikah",
            loc: akad_location,
            map: akad_map,
            dt: akad_datetime,
          },
          {
            title: "Resepsi",
            loc: resepsi_location,
            map: resepsi_map,
            dt: resepsi_datetime,
          },
        ].map(
          (evt, i) =>
            evt.loc && (
              <div key={i} className="mb-8">
                <h3 className="text-2xl font-semibold text-pink-600">
                  {evt.title}
                </h3>
                <p>{evt.loc}</p>
                {evt.dt && <p>{formatDateTime(evt.dt)}</p>}
                {evt.map && (
                  <a href={evt.map} className="text-blue-500" target="_blank">
                    Lihat Peta
                  </a>
                )}
              </div>
            )
        )}
      </section>

      {/* Galeri */}
      {galleryImages?.length ? (
        <section className="px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-8">Galeri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <img
                key={i}
                src={getImagePath(img, "/default-gallery.jpg")}
                alt={`Galeri ${i + 1}`}
                className="w-full h-40 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Gift */}
      {(bank1_name || bank2_name) && (
        <section className="px-4 py-12 text-center bg-gray-50">
          <h2 className="text-3xl font-bold mb-6">Wedding Gift</h2>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            {[
              {
                name: bank1_name,
                accName: bank1_account_name,
                accNum: bank1_account_number,
              },
              {
                name: bank2_name,
                accName: bank2_account_name,
                accNum: bank2_account_number,
              },
            ]
              .filter((b) => b.name)
              .map((b, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded shadow w-full md:w-80"
                >
                  <h3 className="text-xl font-semibold">{b.name}</h3>
                  <p className="mt-2">A.N: {b.accName}</p>
                  <p className="text-lg font-bold">{b.accNum}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(b.accNum || "");
                      toast.info("Nomor disalin!");
                    }}
                    className="mt-2 text-blue-600"
                  >
                    Salin
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="px-4 py-12 text-center bg-pink-100">
        <h2 className="text-3xl font-bold mb-6">Konfirmasi Kehadiran</h2>
        <form
          className="max-w-md mx-auto space-y-4"
          onSubmit={handleRsvpSubmit}
        >
          <select
            value={rsvpStatus}
            onChange={(e) => setRsvpStatus(e.target.value)}
            required
            className="w-full p-3 border rounded"
          >
            <option value="hadir">Hadir</option>
            <option value="tidak hadir">Tidak Hadir</option>
          </select>
          {rsvpStatus === "hadir" && (
            <input
              type="number"
              min={1}
              value={peopleCount}
              onChange={(e) => setPeopleCount(Math.max(1, +e.target.value))}
              className="w-full p-3 border rounded"
              required
            />
          )}
          <button
            type="submit"
            disabled={isRsvpSubmitting}
            className="w-full bg-pink-600 text-white p-3 rounded"
          >
            {isRsvpSubmitting ? "Mengirim..." : "Kirim RSVP"}
          </button>
        </form>
      </section>

      {/* Ucapan */}
      <section className="px-4 py-12 text-center bg-blue-50">
        <h2 className="text-3xl font-bold mb-6">Doa & Ucapan</h2>
        <form
          className="max-w-lg mx-auto space-y-4"
          onSubmit={handleUcapanSubmit}
        >
          <input
            type="text"
            value={ucapanName}
            onChange={(e) => setUcapanName(e.target.value)}
            placeholder="Nama Anda"
            className="w-full p-3 border rounded"
            required
          />
          <textarea
            rows={3}
            value={ucapanMessage}
            onChange={(e) => setUcapanMessage(e.target.value)}
            placeholder="Ucapan & doa..."
            className="w-full p-3 border rounded"
            required
          />
          <button
            type="submit"
            disabled={isUcapanSubmitting}
            className="w-full bg-blue-600 text-white p-3 rounded"
          >
            {isUcapanSubmitting ? "Mengirim..." : "Kirim Ucapan"}
          </button>
        </form>
        <div className="mt-8 space-y-4 max-w-lg mx-auto">
          {ucapanList.length ? (
            ucapanList.map((u) => (
              <div key={u.id} className="text-left bg-white p-4 rounded shadow">
                <p className="font-semibold">{u.name}</p>
                <p className="italic mt-1">"{u.message}"</p>
                <p className="text-xs text-gray-500 text-right">
                  {new Date(u.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            ))
          ) : (
            <p>Belum ada ucapan. Jadilah yang pertama!</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} {website_title || ""}. All rights reserved.
      </footer>
    </div>
  );
}
