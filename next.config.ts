// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ Tambahkan baris ini
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Adjust this value as needed
    },
  },
};

export default nextConfig;
