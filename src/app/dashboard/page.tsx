// src/app/dashboard/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react"; // Tambahkan useCallback
import StatCard from "@/components/StatCard";
import GuestRow from "@/components/GuestRow";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const initialStats = [
  { title: "Jumlah Tamu", value: "0", color: "bg-pink-100 text-pink-800" },
  {
    title: "Undangan Terkirim",
    value: "0",
    color: "bg-green-100 text-green-800",
  },
  { title: "RSVP Masuk", value: "0", color: "bg-blue-100 text-blue-800" },
  {
    title: "Jumlah Hadir",
    value: "0",
    color: "bg-yellow-100 text-yellow-800",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterSent, setFilterSent] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterRSVP, setFilterRSVP] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGuestIndex, setSelectedGuestIndex] = useState<number | null>(
    null
  );
  // userId tidak digunakan di frontend untuk fetching tamu, hanya personalizeId yang diperlukan untuk otorisasi
  const [personalizeId, setPersonalizeId] = useState<string | null>(null);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(initialStats);

  const [addForm, setAddForm] = useState({
    name: "",
    phone: "",
    address: "",
    invitation_type: "personal",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    invitation_type: "personal",
  });

  const popupRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Fungsi untuk mengambil dan memperbarui tamu serta statistik ---
  const fetchAndSetGuestsAndStats = useCallback(
    async (currentPersonalizeId: string) => {
      setLoadingGuests(true);
      try {
        const res = await fetch(
          `/api/guests?personalize_id=${currentPersonalizeId}`
        );
        const data = await res.json();

        if (res.ok) {
          const fetchedGuests = data.guests.map((guest: any) => ({
            ...guest,
            // Pastikan nilai default jika null/undefined dari backend
            status: guest.status || "-", // Akan menjadi '-' jika tidak ada RSVP
            people_count: guest.people_count || 0,
            is_sent: guest.is_sent || false, // Pastikan is_sent boolean
          }));
          setGuests(fetchedGuests);

          // Hitung statistik berdasarkan fetchedGuests terbaru
          const totalGuests = fetchedGuests.length;
          const sentInvitations = fetchedGuests.filter(
            (g: any) => g.is_sent
          ).length;
          const rsvpConfirmed = fetchedGuests.filter(
            (g: any) => g.status && g.status !== "-" // RSVP dianggap masuk jika ada status selain '-'
          ).length;
          const hadirCount = fetchedGuests.filter(
            (g: any) => g.status === "hadir"
          ).length;

          setDashboardStats([
            { ...initialStats[0], value: totalGuests.toString() },
            { ...initialStats[1], value: sentInvitations.toString() },
            { ...initialStats[2], value: rsvpConfirmed.toString() },
            { ...initialStats[3], value: hadirCount.toString() },
          ]);
        } else {
          toast.error(
            `Gagal memuat data tamu: ${data.error || "Terjadi kesalahan"}`
          );
          setGuests([]);
          setDashboardStats(initialStats);
        }
      } catch (err) {
        console.error("Error fetching guests:", err);
        toast.error("Gagal terhubung ke server untuk memuat data tamu.");
        setGuests([]);
        setDashboardStats(initialStats);
      } finally {
        setLoadingGuests(false);
      }
    },
    []
  ); // Tidak ada dependency karena menggunakan parameter currentPersonalizeId

  // --- Effect 1: Ambil Personalize ID dari Sesi saat Komponen Dimuat ---
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (res.ok && data.isAuthenticated && data.user.personalizeId) {
          // setUserId(data.user.id); // userId tidak diperlukan di frontend untuk operasi tamu
          setPersonalizeId(data.user.personalizeId);
          // Setelah personalizeId didapatkan, panggil fungsi untuk mengambil tamu
          fetchAndSetGuestsAndStats(data.user.personalizeId);
        } else {
          toast.error("Anda harus login untuk mengakses dashboard.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        toast.error("Gagal memuat sesi pengguna. Silakan login ulang.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        router.push("/login");
      }
    };

    fetchUserSession();
  }, [router, fetchAndSetGuestsAndStats]); // Tambahkan fetchAndSetGuestsAndStats sebagai dependency

  // Filter logika sudah benar, tidak perlu diubah

  const filteredGuests = guests.filter((g) => {
    const nameMatch = g.name.toLowerCase().includes(search.toLowerCase());
    const sentMatch =
      filterSent.length === 0 ||
      (filterSent.includes("sent") && g.is_sent) ||
      (filterSent.includes("unsent") && !g.is_sent);

    const typeMatch =
      filterType.length === 0 || filterType.includes(g.invitation_type);

    const rsvpMatch =
      filterRSVP.length === 0 || filterRSVP.includes(g.status?.toLowerCase());

    return nameMatch && sentMatch && typeMatch && rsvpMatch;
  });

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  const currentGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAdd = async () => {
    if (
      !addForm.name ||
      !addForm.phone ||
      !addForm.address ||
      !addForm.invitation_type
    ) {
      toast.warn("Gagal menambahkan tamu: Pastikan semua kolom terisi.", {
        position: "top-center",
      });
      return;
    }
    if (!personalizeId) {
      toast.error("Sesi personalisasi tidak valid. Silakan login ulang.", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          personalize_id: personalizeId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        toast.success("Tamu berhasil ditambahkan!", {
          position: "top-center",
        });
        // Setelah berhasil, panggil ulang untuk memperbarui daftar dan statistik
        fetchAndSetGuestsAndStats(personalizeId);
        setAddForm({
          name: "",
          phone: "",
          address: "",
          invitation_type: "personal",
        }); // Reset form setelah sukses
      } else {
        toast.error(
          `Gagal menambahkan tamu: ${data.error || "Terjadi kesalahan"}`,
          { position: "top-center" }
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan tamu. Silakan coba lagi.", {
        position: "top-center",
      });
    }
  };

  const handleEdit = async () => {
    if (selectedGuestIndex === null) return;
    if (!personalizeId) {
      toast.error("Sesi personalisasi tidak valid. Silakan login ulang.", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }

    const guestToUpdate = filteredGuests[selectedGuestIndex]; // Pastikan mengedit dari filteredGuests
    const originalGuestIndex = guests.findIndex(
      (g) => g.id === guestToUpdate.id
    ); // Cari index asli di `guests`

    if (originalGuestIndex === -1) {
      // Safety check
      toast.error("Tamu tidak ditemukan.", { position: "top-center" });
      return;
    }

    const updatedData = {
      id: guestToUpdate.id, // Gunakan ID dari guest yang dipilih
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address,
      invitation_type: editForm.invitation_type,
      personalize_id: personalizeId,
    };

    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        setShowEditModal(false);
        toast.success("Tamu berhasil diperbarui!", {
          position: "top-center",
        });
        // Setelah berhasil, panggil ulang untuk memperbarui daftar dan statistik
        fetchAndSetGuestsAndStats(personalizeId);
      } else {
        const data = await res.json();
        toast.error(
          `Gagal memperbarui tamu: ${data.error || "Terjadi kesalahan"}`,
          { position: "top-center" }
        );
      }
    } catch (err) {
      console.error("Gagal update tamu:", err);
      toast.error("Gagal memperbarui tamu. Silakan coba lagi.", {
        position: "top-center",
      });
    }
  };

  const handleDelete = async () => {
    if (selectedGuestIndex === null) return;
    if (!personalizeId) {
      toast.error("Sesi personalisasi tidak valid. Silakan login ulang.", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }

    const guestToDelete = filteredGuests[selectedGuestIndex]; // Pastikan menghapus dari filteredGuests

    try {
      const res = await fetch("/api/guests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: guestToDelete.id,
          personalize_id: personalizeId,
        }),
      });

      if (res.ok) {
        setShowDeleteModal(false);
        toast.success("Tamu berhasil dihapus!", {
          position: "top-center",
        });
        // Setelah berhasil, panggil ulang untuk memperbarui daftar dan statistik
        fetchAndSetGuestsAndStats(personalizeId);
      } else {
        const data = await res.json();
        toast.error(
          `Gagal menghapus tamu: ${data.error || "Terjadi kesalahan"}`,
          { position: "top-center" }
        );
      }
    } catch (err) {
      console.error("Gagal hapus tamu:", err);
      toast.error("Terjadi kesalahan saat menghapus tamu. Silakan coba lagi.", {
        position: "top-center",
      });
    }
  };

  const handleToggleSent = async (globalIndex: number, newSent: boolean) => {
    if (!personalizeId) {
      toast.error("Sesi personalisasi tidak valid. Silakan login ulang.", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }
    try {
      // Temukan tamu berdasarkan ID karena indeks bisa berubah saat filtering/pagination
      const guestToUpdate = guests[globalIndex];
      if (!guestToUpdate) {
        toast.error("Tamu tidak ditemukan untuk diperbarui.", {
          position: "top-center",
        });
        return;
      }

      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: guestToUpdate.id,
          is_sent: newSent,
          personalize_id: personalizeId,
        }),
      });

      if (res.ok) {
        toast.info(
          `Status kirim undangan untuk ${guestToUpdate.name} diperbarui.`,
          { position: "top-center" }
        );
        // Setelah berhasil, panggil ulang untuk memperbarui daftar dan statistik
        fetchAndSetGuestsAndStats(personalizeId);
      } else {
        const data = await res.json();
        toast.error(
          `Gagal memperbarui status kirim: ${data.error || "Terjadi kesalahan"}`
        );
      }
    } catch (error) {
      console.error("Error updating sent status:", error);
      toast.error("Gagal memperbarui status kirim.", {
        position: "top-center",
      });
    }
  };

  const renderPagination = () => {
    const pages: React.ReactNode[] = [];

    const addPage = (page: number) => {
      pages.push(
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1 rounded text-sm ${
            currentPage === page
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {page}
        </button>
      );
    };

    const addEllipsis = (key: string) => {
      pages.push(
        <span key={key} className="px-2 py-1 text-gray-500 text-sm">
          ...
        </span>
      );
    };

    const maxVisible = 8; // Jumlah maksimum tombol halaman yang terlihat

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) addPage(i);
    } else {
      // Logika paginasi yang lebih kompleks untuk banyak halaman
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) addPage(i);
        addEllipsis("right");
        for (let i = totalPages - 1; i <= totalPages; i++) addPage(i); // Hanya 2 halaman terakhir
      } else if (currentPage >= totalPages - 3) {
        for (let i = 1; i <= 2; i++) addPage(i); // Hanya 2 halaman pertama
        addEllipsis("left");
        for (let i = totalPages - 4; i <= totalPages; i++) addPage(i);
      } else {
        addPage(1);
        addEllipsis("left");

        for (let i = currentPage - 1; i <= currentPage + 1; i++) addPage(i);

        addEllipsis("right");
        addPage(totalPages);
      }
    }

    return (
      <div className="flex flex-col items-center justify-center gap-2 mt-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <i className="ri-arrow-left-s-line text-sm" />
          </button>

          {pages}

          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className={`px-2 py-1 rounded text-sm flex items-center justify-center ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <i className="ri-arrow-right-s-line text-sm" />
          </button>
        </div>

        <span className="text-sm text-gray-600">
          Halaman {currentPage} dari {totalPages}
        </span>
      </div>
    );
  };

  const renderModal = (
    title: string,
    form: any,
    setForm: (v: any) => void,
    onSubmit: () => void,
    onClose: () => void
  ) => (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20 px-4">
      <div className="bg-white p-6 rounded w-full max-w-sm text-sm font-normal shadow-sm">
        <h2 className="text-base font-semibold mb-6">{title}</h2>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Nama</label>
          <input
            className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">No HP</label>
          <input
            className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Alamat</label>
          <input
            className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium">Invitation Type</label>
          <div className="flex gap-4 mt-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="invitation_type"
                value="personal"
                checked={form.invitation_type === "personal"}
                onChange={(e) =>
                  setForm({ ...form, invitation_type: e.target.value })
                }
                className="accent-blue-500"
              />
              <span className="ml-2 text-sm">Personal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="invitation_type"
                value="group"
                checked={form.invitation_type === "group"}
                onChange={(e) =>
                  setForm({ ...form, invitation_type: e.target.value })
                }
                className="accent-blue-500"
              />
              <span className="ml-2 text-sm">Group</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-600 text-sm">
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );

  const startDelete = (index: number) => {
    setSelectedGuestIndex(index);
    setShowDeleteModal(true);
  };

  // UI loading state berdasarkan personalizeId dan loadingGuests
  if (!personalizeId && loadingGuests) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Memuat sesi personalisasi...</p>
      </div>
    );
  }

  // UI redirecting state jika personalizeId tidak ada setelah loading
  if (!personalizeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Mengarahkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <main className="p-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {dashboardStats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        <div className="flex flex-col gap-3 relative z-0 min-h-[200px]">
          <div className="flex gap-2 w-full items-center">
            <button
              onClick={() => {
                setAddForm({
                  name: "",
                  phone: "",
                  address: "",
                  invitation_type: "personal",
                });
                setShowAddModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm text-sm"
            >
              + Tambah Tamu
            </button>

            <input
              type="text"
              placeholder="Cari tamu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded shadow-sm text-sm text-base focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
            />
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilter(!showFilter)}
                className="bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded flex items-center justify-center relative border border-gray-300"
              >
                <i className="ri-filter-3-line text-lg text-gray-700" />
              </button>
              {showFilter && (
                <div
                  ref={popupRef}
                  className="absolute top-full right-0 mt-2 bg-gray-50 border border-gray-300 rounded shadow p-4 z-[9999] w-64 space-y-4 text-sm"
                >
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Status Kirim
                    </label>
                    <div className="flex flex-col space-y-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterSent.includes("sent")}
                          onChange={(e) =>
                            setFilterSent((prev) =>
                              e.target.checked
                                ? [...prev, "sent"]
                                : prev.filter((v) => v !== "sent")
                            )
                          }
                          className="accent-blue-500"
                        />
                        <span className="text-sm">Sudah Dikirim</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterSent.includes("unsent")}
                          onChange={(e) =>
                            setFilterSent((prev) =>
                              e.target.checked
                                ? [...prev, "unsent"]
                                : prev.filter((v) => v !== "unsent")
                            )
                          }
                          className="accent-blue-500"
                        />
                        <span className="text-sm">Belum Dikirim</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Tipe Undangan
                    </label>
                    <div className="flex flex-col space-y-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterType.includes("personal")}
                          onChange={(e) =>
                            setFilterType((prev) =>
                              e.target.checked
                                ? [...prev, "personal"]
                                : prev.filter((v) => v !== "personal")
                            )
                          }
                          className="accent-blue-500"
                        />
                        <span className="text-sm">Personal</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterType.includes("group")}
                          onChange={(e) =>
                            setFilterType((prev) =>
                              e.target.checked
                                ? [...prev, "group"]
                                : prev.filter((v) => v !== "group")
                            )
                          }
                          className="accent-blue-500"
                        />
                        <span className="ml-2 text-sm">Group</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Status Kehadiran
                    </label>
                    <div className="flex flex-col space-y-1">
                      {["hadir", "tidak hadir", "-"].map((status) => (
                        <label key={status} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filterRSVP.includes(status)}
                            onChange={(e) =>
                              setFilterRSVP((prev) =>
                                e.target.checked
                                  ? [...prev, status]
                                  : prev.filter((v) => v !== status)
                              )
                            }
                            className="accent-blue-500"
                          />
                          <span className="text-sm capitalize">
                            {status === "-"
                              ? "Belum Konfirmasi"
                              : status === "hadir"
                              ? "Hadir"
                              : "Tidak Hadir"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setFilterSent([]);
                        setFilterType([]);
                        setFilterRSVP([]);
                        setShowFilter(false);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Reset Filter
                    </button>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <i className="ri-close-line text-lg" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loadingGuests ? (
            <div className="flex items-center justify-center min-h-[300px] text-gray-600">
              <p>Memuat data tamu...</p>
            </div>
          ) : currentGuests.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px] text-gray-600">
              <p>Tidak ada data tamu untuk ditampilkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full table-fixed text-sm">
                <thead className="bg-gray-100 text-left uppercase text-xs text-gray-500">
                  <tr>
                    <th className="px-2 py-2 text-center w-6">#</th>
                    <th className="px-2 py-2 text-center">✔</th>
                    <th className="px-4 py-2">Nama</th>
                    <th className="py-2 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGuests.map((g, i) => (
                    <GuestRow
                      key={g.id}
                      index={(currentPage - 1) * itemsPerPage + i + 1}
                      guestId={g.id}
                      name={g.name}
                      phone={g.phone}
                      address={g.address}
                      code={g.code}
                      invitation_type={g.invitation_type}
                      status={g.status}
                      people_count={g.people_count}
                      is_sent={g.is_sent}
                      // onToggleSent sekarang langsung memanggil fetchAndSetGuestsAndStats
                      onToggleSent={() =>
                        handleToggleSent(
                          guests.findIndex((guest) => guest.id === g.id), // Cari index di `guests` array penuh
                          !g.is_sent
                        )
                      }
                      onEdit={() => {
                        setSelectedGuestIndex(
                          // Set selectedGuestIndex ke index di filteredGuests
                          (currentPage - 1) * itemsPerPage + i
                        );
                        setEditForm({
                          name: g.name,
                          phone: g.phone,
                          address: g.address,
                          invitation_type: g.invitation_type,
                        });
                        setShowEditModal(true);
                      }}
                      onDelete={() =>
                        startDelete((currentPage - 1) * itemsPerPage + i)
                      }
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4}>
                      <div className="py-4">{renderPagination()}</div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-sm font-normal">
              <h2 className="text-base font-semibold mb-4">Hapus Tamu</h2>
              <p className="mb-6 text-gray-700">
                Apakah kamu yakin ingin menghapus tamu ini?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-600"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddModal &&
          renderModal("Tambah Tamu", addForm, setAddForm, handleAdd, () =>
            setShowAddModal(false)
          )}
        {showEditModal &&
          renderModal("Edit Tamu", editForm, setEditForm, handleEdit, () =>
            setShowEditModal(false)
          )}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false} // PERBAIKAN: Gunakan hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
