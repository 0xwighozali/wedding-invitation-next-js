// components/BankSelect.tsx
"use client";

import Select from "react-select";

const bankOptions = [
  { value: "bca", label: "BCA" },
  { value: "bri", label: "BRI" },
  { value: "bni", label: "BNI" },
  { value: "mandiri", label: "Mandiri" },
  { value: "btn", label: "BTN" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "danamon", label: "Danamon" },
  { value: "permata", label: "Permata" },
  { value: "muamalat", label: "Muamalat" },
];

export default function BankSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const selected = bankOptions.find((opt) => opt.value === value);
  return (
    <Select
      className="mb-2 text-sm"
      placeholder={placeholder}
      value={selected}
      onChange={(opt) => onChange(opt?.value || "")}
      options={bankOptions}
      isSearchable
    />
  );
}
