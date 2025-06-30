// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Hanya ini yang perlu diimpor
// Hapus baris ini: import "react-toastify/dist/theme.colored.css";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validasi password
    if (password !== confirmPassword) {
      toast.error("Kata sandi dan konfirmasi tidak sama!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored", // Tema diatur di sini
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        toast.success(
          data.message || "Pendaftaran bersshasil! Silakan login.",
          {
            position: "top-center",
            autoClose: 2000,
            theme: "colored", // Tema diatur di sini
          }
        );
        setTimeout(() => {
          router.push("/login");
        }, 3500);
      } else {
        toast.error(data.message || "Pendaftaran gagal.", {
          position: "top-center",
          autoClose: 5000,
          theme: "colored", // Tema diatur di sini
        });
      }
    } catch (error) {
      console.error("Kesalahan saat mendaftar:", error);
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.", {
        position: "top-center",
        autoClose: 5000,
        theme: "colored", // Tema diatur di sini
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow w-full max-w-sm space-y-5"
      >
        <h1 className="text-xl font-semibold text-center">Daftar Akun</h1>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full border-b border-gray-300 p-2 bg-transparent mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            placeholder="Kata Sandi"
            className="w-full border-b border-gray-300 p-2 bg-transparent mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Konfirmasi Password */}
        <div>
          <input
            type="password"
            placeholder="Ulangi Kata Sandi"
            className="w-full border-b border-gray-300 p-2 bg-transparent mb-4"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Tombol Register */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded shadow transition-colors duration-200 ${
            loading
              ? "bg-blue-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>

        {/* Link ke Login */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Masuk
          </a>
        </p>
      </form>
      {/* ToastContainer untuk menampilkan notifikasi */}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Tema diatur di sini
        limit={3}
      />
    </div>
  );
}
