import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: Esto permite que el build de producción termine aunque haya errores de ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
