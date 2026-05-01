import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/supabase-image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jkpenklhrlbctebkpvax.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.wanwalk.jp" }],
        destination: "https://wanwalk.jp/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
