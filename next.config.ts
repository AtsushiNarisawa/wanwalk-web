import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    loader: "custom",
    loaderFile: "./src/lib/supabase-image-loader.ts",
    deviceSizes: [640, 1080, 1920],
    imageSizes: [400, 640],
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

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
