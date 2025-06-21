// src/components/Sidebar.tsx

export default function Sidebar() {
    return (
      <aside className="w-16 sm:w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
        <div className="mb-8">
          <button className="text-2xl sm:hidden">☰</button>
          <h1 className="hidden sm:block text-xl font-bold">LOGO</h1>
        </div>
      </aside>
    );
  }
  