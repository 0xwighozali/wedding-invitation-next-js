"use client";

interface GuestFormProps {
  form: {
    name: string;
    phone: string;
    address: string;
    invitation_type: string;
  };
  setForm: (v: any) => void;
  onSubmit: () => void;
  onClose: () => void;
  title: string;
}

export default function GuestForm({
  form,
  setForm,
  onSubmit,
  onClose,
  title,
}: GuestFormProps) {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20 px-4">
      <div className="bg-white p-6 rounded w-full max-w-sm text-sm font-normal shadow-sm -translate-y-25">
        <h2 className="text-base font-semibold mb-6">{title}</h2>

        {/* Nama */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">
            Nama Tamu/Keluarga/Group
          </label>
          <input
            className="w-full border-b border-gray-300 p-1 outline-none text-sm"
            placeholder="Masukkan nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* No HP */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">No HP</label>
          <input
            className="w-full border-b border-gray-300 p-1 outline-none text-sm"
            placeholder="Masukkan nomor"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Alamat */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">Alamat</label>
          <input
            className="w-full border-b border-gray-300 p-1 outline-none text-sm"
            placeholder="Masukkan alamat"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        {/* Invitation Type */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium">Invitation Type</label>
          <div className="flex gap-4">
            {["group", "personal"].map((type) => (
              <label key={type} className="inline-flex items-center">
                <input
                  type="radio"
                  name="invitation_type"
                  value={type}
                  checked={form.invitation_type === type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invitation_type: e.target.value,
                    })
                  }
                  className="accent-blue-500"
                />
                <span className="ml-2 text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tombol */}
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
}
