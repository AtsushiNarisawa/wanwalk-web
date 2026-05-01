"use client";

const SUPABASE_PUBLIC_PREFIX = "/storage/v1/object/public/";
const SUPABASE_RENDER_PREFIX = "/storage/v1/render/image/public/";

export default function supabaseImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.includes(SUPABASE_PUBLIC_PREFIX)) {
    const transformed = src.replace(
      SUPABASE_PUBLIC_PREFIX,
      SUPABASE_RENDER_PREFIX,
    );
    const url = new URL(transformed);
    url.searchParams.set("width", width.toString());
    url.searchParams.set("quality", (quality ?? 75).toString());
    return url.toString();
  }

  if (src.includes(SUPABASE_RENDER_PREFIX)) {
    const url = new URL(src);
    url.searchParams.set("width", width.toString());
    url.searchParams.set("quality", (quality ?? 75).toString());
    return url.toString();
  }

  return src;
}
