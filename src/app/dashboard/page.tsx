"use client";

import { useState, useRef, useEffect } from "react";
import StatCard from "@/components/StatCard";
import GuestRow from "@/components/GuestRow";

const stats = [
  { title: "Jumlah Tamu", value: "1050", color: "bg-pink-100 text-pink-800" },
  {
    title: "Undangan Terkirim",
    value: "890",
    color: "bg-green-100 text-green-800",
  },
  { title: "RSVP Masuk", value: "700", color: "bg-blue-100 text-blue-800" },
  {
    title: "Jumlah Hadir",
    value: "1230",
    color: "bg-yellow-100 text-yellow-800",
  },
];

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterSent, setFilterSent] = useState<null | boolean>(null);
  const [notification, setNotification] = useState("");
  const [guests, setGuests] = useState(
    Array.from({ length: 200 }, (_, i) => ({
      name: `Tamu ${i + 1}`,
      phone: `08${Math.floor(1000000000 + Math.random() * 900000000)}`,
      address: `Alamat ${i + 1}`,
      sent: i % 2 === 0,
    }))
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGuestIndex, setSelectedGuestIndex] = useState<number | null>(
    null
  );
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const popupRef = useRef<HTMLDivElement | null>(null);

  const filteredGuests = guests.filter((g) => {
    const nameMatch = g.name.toLowerCase().includes(search.toLowerCase());
    const sentMatch = filterSent === null || g.sent === filterSent;
    return nameMatch && sentMatch;
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
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAdd = () => {
    if (!form.name || !form.phone || !form.address) {
      setNotification("Gagal: Data tidak lengkap");
      return;
    }
    setGuests([...guests, { ...form, sent: false }]);
    setForm({ name: "", phone: "", address: "" });
    setShowAddModal(false);
    setNotification("Tamu berhasil ditambahkan");
  };

  const handleEdit = () => {
    if (selectedGuestIndex === null) return;
    const updated = [...guests];
    updated[selectedGuestIndex] = { ...updated[selectedGuestIndex], ...form };
    setGuests(updated);
    setShowEditModal(false);
    setNotification("Tamu berhasil diubah");
  };

  const handleDelete = () => {
    if (selectedGuestIndex === null) return;
    const updated = guests.filter((_, i) => i !== selectedGuestIndex);
    setGuests(updated);
    setShowDeleteModal(false);
    setNotification("Tamu berhasil dihapus");
  };

  const startEdit = (index: number) => {
    setSelectedGuestIndex(index);
    const guest = guests[index];
    setForm({ name: guest.name, phone: guest.phone, address: guest.address });
    setShowEditModal(true);
  };

  const startDelete = (index: number) => {
    setSelectedGuestIndex(index);
    setShowDeleteModal(true);
  };

  const renderPagination = () => {
    const visiblePages = 5;
    let start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let end = Math.min(totalPages, start + visiblePages - 1);
    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    return (
      <div className="flex justify-center gap-2">
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
          (p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === p
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow text-sm z-50">
          {notification}
        </div>
      )}

      {/* Main Content */}
      <main className="p-2 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 relative">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded shadow text-sm"
          >
            + Tambah Tamu
          </button>

          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Cari tamu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm text-sm"
            />
            <button className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center">
              <i className="ri-search-line text-lg text-gray-700" />
            </button>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center relative z-10"
            >
              <i className="ri-filter-3-line text-lg text-gray-700" />
            </button>
          </div>

          {showFilter && (
            <div
              ref={popupRef}
              className="absolute right-0 top-[110%] bg-gray-100 border border-gray-300 rounded shadow p-4 z-20 w-52"
            >
              <div className="flex flex-col gap-3 text-sm font-normal">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterSent === false}
                      onChange={() =>
                        setFilterSent(filterSent === false ? null : false)
                      }
                    />
                    Belum Dikirim
                  </label>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="ri-close-line text-lg" />
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterSent === true}
                    onChange={() =>
                      setFilterSent(filterSent === true ? null : true)
                    }
                  />
                  Sudah Dikirim
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
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
                  key={i}
                  index={(currentPage - 1) * itemsPerPage + i + 1}
                  {...g}
                  onEdit={() => startEdit((currentPage - 1) * itemsPerPage + i)}
                  onDelete={() =>
                    startDelete((currentPage - 1) * itemsPerPage + i)
                  }
                />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center">
                  {renderPagination()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>

      {/* Modal Tambah */}
      {showAddModal &&
        renderModal("Tambah Tamu", handleAdd, setShowAddModal, form, setForm)}

      {/* Modal Edit */}
      {showEditModal &&
        renderModal("Edit Tamu", handleEdit, setShowEditModal, form, setForm)}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20">
          <div className="bg-white p-6 rounded w-full max-w-sm text-center text-sm font-normal shadow-sm -translate-y-25">
            <h2 className="text-base font-semibold mb-4">
              Yakin ingin menghapus tamu ini?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderModal(
  title: string,
  onSubmit: () => void,
  onClose: (v: boolean) => void,
  form: { name: string; phone: string; address: string },
  setForm: (v: any) => void
) {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20">
      <div className="bg-white p-6 rounded w-full max-w-sm text-sm font-normal shadow-sm -translate-y-25">
        <h2 className="text-base font-semibold mb-4">{title}</h2>
        <input
          className="w-full border border-gray-300 p-2 rounded mb-2"
          placeholder="Nama"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 p-2 rounded mb-2"
          placeholder="No HP"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 p-2 rounded mb-4"
          placeholder="Alamat"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => onClose(false)} className="text-gray-600">
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
