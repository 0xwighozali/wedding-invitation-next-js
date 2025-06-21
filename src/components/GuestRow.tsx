"use client";
import { useState } from "react";

interface GuestProps {
  index: number;
  name: string;
  phone: string;
  address: string;
  sent: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function GuestRow({
  index,
  name,
  phone,
  address,
  sent,
  onEdit,
  onDelete,
}: GuestProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <tr className="border-b border-gray-200">
      <td className="px-2 py-4 text-center text-xs text-gray-500">{index}</td>
      <td className="px-2 py-4 text-center">
        <input type="checkbox" />
      </td>
      <td className="px-4 py-4">
        <div className="cursor-pointer">
          <div className="font-semibold text-sm">{name}</div>

          {showDetail && (
            <div className="mt-1 text-xs text-gray-600 space-y-1 border-t border-gray-200 pt-2">
              <div>
                <i className="ri-phone-line mr-1 text-gray-500" />
                {phone}
              </div>
              <div>
                <i className="ri-map-pin-line mr-1 text-gray-500" />
                {address}
              </div>
              <div>
                <i className="ri-key-line mr-1 text-gray-500" />
                Kode Undangan:{" "}
                <span className="font-medium">
                  INV-{index.toString().padStart(3, "0")}
                </span>
              </div>
              <div>
                <i className="ri-checkbox-circle-line mr-1 text-gray-500" />
                Kehadiran: <span className="italic">Belum Dikonfirmasi</span>
              </div>
              <div>
                <i className="ri-group-line mr-1 text-gray-500" />
                Jumlah Orang: <span className="font-medium">2</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowDetail((prev) => !prev)}
            className="text-blue-500 text-xs mt-2"
          >
            {showDetail ? "Tutup" : "Lihat Detail"}
          </button>
        </div>
      </td>
      <td className="px-4 py-4 text-sm">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700"
          >
            <i className="ri-edit-2-line" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <i className="ri-delete-bin-line" />
          </button>
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-700"
          >
            <i className="ri-whatsapp-line" />
          </a>
        </div>
      </td>
    </tr>
  );
}
