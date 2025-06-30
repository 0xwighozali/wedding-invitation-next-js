// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer dan toast
import "react-toastify/dist/ReactToastify.css"; // HANYA CSS dasar yang diimpor

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Mulai loading state lebih awal

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false); // Hentikan loading setelah respons diterima

      if (res.ok) {
        // Login berhasil
        toast.success(data.message || "Login berhasil! Selamat datang.", {
          position: "top-center", // Notifikasi muncul di tengah atas
          autoClose: 1000, // Durasi 1 detik (sesuai contoh Anda, saya kira ini yang dimaksud untuk tampilan cepat)
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored", // TEMA DIATUR DI SINI
        });
        // Arahkan ke dashboard setelah notifikasi muncul
        setTimeout(() => {
          router.push("/dashboard");
        }, 3500); // Beri waktu notifikasi untuk muncul (3.5 detik)
      } else {
        // Login gagal (respons dari server)
        toast.error(
          data.message || "Login gagal. Periksa email atau kata sandi Anda.",
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored", // TEMA DIATUR DI SINI
          }
        );
      }
    } catch (error) {
      console.error("Kesalahan saat submit login:", error);
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored", // TEMA DIATUR DI SINI
      });
      setLoading(false); // Pastikan loading berhenti jika ada error catch
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-full max-w-sm space-y-5"
      >
        <h1 className="text-xl font-semibold text-center">Masuk ke Akun</h1>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full border-b border-gray-300 p-2 bg-transparent mb-4 focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
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
            className="w-full border-b border-gray-300 p-2 bg-transparent mb-2 focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Lupa password?
            </a>
          </div>
        </div>

        {/* Tombol Login */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded shadow transition-colors duration-200 ${
            loading
              ? "bg-blue-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        {/* Pindah ke Register */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Daftar
          </a>
        </p>
      </form>
      {/* ToastContainer untuk menampilkan notifikasi */}
      <ToastContainer
        position="top-right"
        autoClose={5000} // Durasi default toast jika tidak dispesifikasikan per toast
        hideProgressBar={false}
        newestOnTop={true} // Notifikasi baru muncul di atas yang lama
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // TEMA UTAMA DIATUR DI SINI (akan diterapkan jika tidak di-override per toast)
        limit={3} // Batasi jumlah toast yang terlihat sekaligus
      />
    </div>
  );
}
