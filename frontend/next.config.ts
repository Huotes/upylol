import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Use unoptimized to bypass Next.js image proxy for DDragon CDN.
    // This prevents 403/504 errors from the _next/image endpoint
    // and loads images directly from Riot's CDN (faster).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
        pathname: "/cdn/**",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    // BACKEND_URL aponta para o serviço Docker (server-side).
    // NEXT_PUBLIC_API_URL é para o browser (client-side) e não deve ser usado aqui.
    const backendUrl = process.env.BACKEND_URL ?? "http://backend:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
