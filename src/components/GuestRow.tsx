"use client";
import { useState } from "react";
import { toast } from "react-toastify"; // Pastikan Anda mengimpor toast

interface GuestProps {
  index: number;
  guestId: string;
  name: string;
  phone: string;
  address: string;
  code?: string;
  invitation_type?: string;
  status?: string; // 🆕 Diubah dari rsvp_status menjadi status
  people_count?: number;
  is_sent: boolean;
  onToggleSent: (newSent: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function GuestRow({
  index,
  guestId,
  name,
  phone,
  address,
  code,
  invitation_type = "-", // Default value
  status = "-", // 🆕 Diubah dari rsvp_status, default value '-'
  people_count = 0, // Default value
  is_sent,
  onToggleSent,
  onEdit,
  onDelete,
}: GuestProps) {
  const handleToggleSent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSent = e.target.checked;
    try {
      const response = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guestId, is_sent: newSent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memperbarui status kirim.");
      }

      onToggleSent(newSent); // update state di parent (ini akan memicu refetch di dashboard)
      toast.success(
        `Status kirim untuk ${name} berhasil diubah menjadi ${
          newSent ? "Sudah Dikirim" : "Belum Dikirim"
        }!`,
        { position: "top-center" }
      );
    } catch (err: any) {
      console.error("Gagal update status kirim:", err);
      toast.error(
        err.message || "Terjadi kesalahan saat memperbarui status kirim.",
        {
          position: "top-center",
        }
      );
    }
  };

  const formatPhoneNumberForWhatsApp = (num: string) => {
    let cleaned = ("" + num).replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (!cleaned.startsWith("62") && cleaned.length > 5) {
      // Hanya tambahkan 62 jika bukan 62 dan terlihat seperti nomor telpon valid
      cleaned = "62" + cleaned;
    }
    return cleaned;
  };

  const whatsappLink = `https://wa.me/${formatPhoneNumberForWhatsApp(phone)}`;

  return (
    <tr className="border-b border-gray-200">
      {/* Index */}
      <td className="px-2 py-4 text-center text-xs text-gray-500">{index}</td>

      {/* Checkbox - Kirim */}
      <td className="px-2 py-4 text-center">
        <input type="checkbox" checked={is_sent} onChange={handleToggleSent} />
      </td>

      {/* Detail Utama */}
      <td className="px-4 py-4">
        <div className="cursor-default">
          <div className="font-semibold text-sm">{name}</div>

          <div className="mt-1 text-xs text-gray-600 space-y-1 border-t border-gray-200 pt-2">
            <div>
              <i className="ri-phone-line mr-1 text-gray-500" />
              {phone}
            </div>
            <div>
              <i className="ri-map-pin-line mr-1 text-gray-500" />
              {address}
            </div>
            {code && (
              <div>
                <i className="ri-key-line mr-1 text-gray-500" />
                Kode Undangan: <span className="font-medium">{code}</span>
              </div>
            )}
            <div>
              <i className="ri-mail-send-line mr-1 text-gray-500" />
              Invitation Type:{" "}
              <span className="capitalize">{invitation_type}</span>
            </div>
            <div>
              <i className="ri-send-plane-line mr-1 text-gray-500" />
              Status Kirim:{" "}
              <span
                className={`font-medium ${
                  is_sent ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {is_sent ? "Sudah Dikirim" : "Belum Dikirim"}
              </span>
            </div>
            <div>
              <i className="ri-checkbox-circle-line mr-1 text-gray-500" />
              Kehadiran:{" "}
              <span className="italic capitalize">
                {status === "-" ? "Belum Konfirmasi" : status}
              </span>
            </div>
            <div>
              <i className="ri-group-line mr-1 text-gray-500" />
              Jumlah Orang: <span className="font-medium">{people_count}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Aksi */}
      <td className="px-4 py-4 text-sm">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700"
            aria-label="Edit Guest"
          >
            <i className="ri-edit-2-line" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete Guest"
          >
            <i className="ri-delete-bin-line" />
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-700"
            aria-label="Send WhatsApp Message"
          >
            <i className="ri-whatsapp-line" />
          </a>
        </div>
      </td>
    </tr>
  );
}
