"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";

type Props = {
  onClose: () => void;
};

export default function MobileSidebar({ onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSelect = (path: string) => {
    router.push(path);
    handleClose();
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Berhasil logout!");
        router.push("/login");
        handleClose();
      } else {
        toast.error(`Gagal logout: ${data.message || "Terjadi kesalahan."}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Terjadi kesalahan saat mencoba logout.");
    }
  };

  const menuItems = [
    { label: "Dashboard", icon: "ri-home-4-line", path: "/dashboard" },
    {
      label: "Personalize",
      icon: "ri-brush-line",
      path: "/dashboard/personalize",
    },
    {
      label: "Settings",
      icon: "ri-settings-3-line",
      path: "/dashboard/settings",
    },
  ];

  return (
    <>
      {/* Overlay + Wrapper */}
      <div
        className={`fixed inset-0 z-40 flex transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white h-full shadow-md p-5 flex flex-col transition-transform duration-200 ${
            // flex flex-col ditambahkan
            visible ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-lg font-semibold">Menu</h1>
            <button onClick={handleClose} className="text-2xl text-gray-700">
              <i className="ri-close-line" />
            </button>
          </div>

          {/* Menu Items (akan mengisi ruang yang tersedia) */}
          <ul className="space-y-4 flex-grow">
            {" "}
            {/* flex-grow ditambahkan */}
            {menuItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleSelect(item.path)}
                    className={`flex items-center gap-x-4 px-3 py-2 w-full text-left rounded ${
                      isActive
                        ? "text-blue-600 border-l-4 border-blue-500 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <i className={`${item.icon} text-xl`} />
                    <span className="text-base">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Tombol Logout (akan didorong ke bawah) */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            {" "}
            {/* mt-auto dan border-t ditambahkan */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-x-4 px-3 py-2 w-full text-left rounded text-red-600 hover:bg-red-50"
            >
              <i className="ri-logout-box-line text-xl" />
              <span className="text-base">Logout</span>
            </button>
          </div>
        </aside>

        {/* Area transparan kanan */}
        <div className="flex-1 bg-transparent" onClick={handleClose} />
      </div>
    </>
  );
}
