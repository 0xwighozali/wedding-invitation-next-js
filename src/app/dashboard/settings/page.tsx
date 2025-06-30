"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SettingsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect hook untuk mengambil email pengguna saat halaman dimuat
  useEffect(() => {
    const fetchUserEmail = async () => {
      setIsLoading(true);
      try {
        const resSession = await fetch("/api/auth/session");
        const sessionData = await resSession.json();

        if (
          !resSession.ok ||
          !sessionData.isAuthenticated ||
          !sessionData.user.email
        ) {
          toast.error("Sesi tidak valid. Silakan login ulang.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
          router.push("/login");
          return;
        }
        setUserEmail(sessionData.user.email);
      } catch (error) {
        console.error("Gagal mengambil email pengguna:", error);
        toast.error("Gagal memuat data pengguna. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserEmail();
  }, [router]);

  // Handler untuk mengubah kata sandi
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Semua kolom kata sandi harus diisi.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.warn("Kata sandi baru harus minimal 6 karakter.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        // Anda perlu membuat API endpoint ini
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Kata sandi berhasil diubah!");
        // Bersihkan formulir setelah berhasil
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(
          `Gagal mengubah kata sandi: ${
            data.message || "Error tidak diketahui"
          }`
        );
      }
    } catch (error) {
      console.error("Error saat mengubah kata sandi:", error);
      toast.error(
        "Terjadi kesalahan saat mengubah kata sandi. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 space-y-6">
      <h1 className="text-lg font-semibold">Pengaturan Akun</h1>

      {/* Bagian Informasi Email */}
      <div className="bg-white p-4 rounded shadow-sm text-sm font-normal space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Informasi Akun</h2>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Alamat Email
          </label>
          <input
            type="email"
            value={userEmail || "Memuat..."}
            readOnly
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alamat email Anda tidak dapat diubah di sini.
          </p>
        </div>
      </div>

      {/* Bagian Ubah Kata Sandi */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white p-4 rounded shadow-sm text-sm font-normal space-y-4"
      >
        <h2 className="text-lg font-semibold border-b pb-2">Ubah Kata Sandi</h2>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700"
            htmlFor="current-password"
          >
            Kata Sandi Saat Ini
          </label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Masukkan kata sandi Anda saat ini"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
            required
          />
        </div>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700"
            htmlFor="new-password"
          >
            Kata Sandi Baru
          </label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Masukkan kata sandi baru Anda"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter.</p>
        </div>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700"
            htmlFor="confirm-new-password"
          >
            Konfirmasi Kata Sandi Baru
          </label>
          <input
            type="password"
            id="confirm-new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Konfirmasi kata sandi baru Anda"
            className="w-full mb-3 border-b border-gray-300 p-1 bg-transparent text-base"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded shadow text-sm ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Mengubah Kata Sandi..." : "Ubah Kata Sandi"}
        </button>
      </form>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
