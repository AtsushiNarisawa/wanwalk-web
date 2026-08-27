import type { Metadata } from "next";

const SITE_BASE = "https://wanwalk.jp";
const FALLBACK_OG_IMAGE =
  "https://jkpenklhrlbctebkpvax.supabase.co/storage/v1/render/image/public/route-photos/yamanakako-lakeside/refetch_20260422/01.jpg?width=1200&height=630&resize=cover&quality=80";

type OgMetaInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  twitterImage?: string;
  ogImageAlt?: string;
};

/**
 * areas.hero_image_url（Supabase Storage の原寸 object URL）を OG 用 1200x630 に変換する。
 * 既に /render/image/ 形式ならそのまま使う。null/undefined のときは undefined を返し、
 * buildOgMetadata 側の共通 fallback（山中湖）に委ねる。
 *
 * ※ /hakone と /hakone/dog-map の両方で使う共通ヘルパー（元は /hakone のローカル関数）。
 */
export function toOgImage(
  heroBase: string | null | undefined
): string | undefined {
  if (!heroBase) return undefined;
  return heroBase.includes("/render/image/")
    ? heroBase
    : heroBase.replace("/object/", "/render/image/") +
        "?width=1200&height=630&resize=cover&quality=80";
}

// Next.js の openGraph は page-level で完全置換されるため、共通の type/siteName/locale/url/images を全ページで明示する。
// twitter も同様に images を明示しないと layout の fallback が残る。
export function buildOgMetadata({
  title,
  description,
  path,
  ogImage = FALLBACK_OG_IMAGE,
  twitterImage,
  ogImageAlt,
}: OgMetaInput): Pick<Metadata, "openGraph" | "twitter"> {
  const url = `${SITE_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const tw = twitterImage ?? ogImage;
  return {
    openGraph: {
      type: "website",
      siteName: "WanWalk",
      locale: "ja_JP",
      url,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [tw],
    },
  };
}

export const WANWALK_FALLBACK_OG_IMAGE = FALLBACK_OG_IMAGE;
export const WANWALK_SITE_BASE = SITE_BASE;
