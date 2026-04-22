import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's on-disk cache vinha corrompendo entre restarts do dev server
    // (SST files ausentes → panic no tokio runtime → HMR para de funcionar).
    // Desligar o cache persistente mantém a velocidade do Turbopack em memória
    // e elimina a necessidade de "rebuild" a cada mudança de front.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
