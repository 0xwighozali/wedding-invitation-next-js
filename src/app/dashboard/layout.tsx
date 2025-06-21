// app/dashboard/layout.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row relative">
      <div className="hidden sm:block">
        <Sidebar />
      </div>

      {sidebarOpen && <MobileSidebar onClose={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-4 py-3 flex items-center sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden text-2xl text-gray-700"
          >
            <i className="ri-menu-line" />
          </button>
        </header>

        <main className="p-4 space-y-6 relative">{children}</main>
      </div>
    </div>
  );
}
