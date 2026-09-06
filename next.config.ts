import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // DO NOT set output: "standalone" when using @opennextjs/cloudflare
  // OpenNext handles bundling automatically; output: "standalone" breaks
  // Server Action ID registration causing "server action not found" errors
};

export default nextConfig;
