import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

// next/font で self-host 化。
// - 外部 fonts.googleapis.com への DNS/TLS 不要
// - サブセット化 + preload 自動付与 + font-display:swap
// - CSS で参照する変数: --font-ww-sans / --font-ww-serif
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});
const notoSerifJp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-serif-jp",
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

const DEFAULT_OG_IMAGE =
  "https://jkpenklhrlbctebkpvax.supabase.co/storage/v1/render/image/public/route-photos/yamanakako-lakeside/refetch_20260422/01.jpg?width=1200&height=630&resize=cover&quality=80";

export const metadata: Metadata = {
  metadataBase: new URL("https://wanwalk.jp"),
  title: {
    default: "WanWalk - 愛犬との散歩コース",
    template: "%s | WanWalk",
  },
  description: "箱根・鎌倉・伊豆…愛犬と歩きたくなる散歩コースを厳選。駐車場・犬可カフェ・トイレ情報つき。",
  openGraph: {
    type: "website",
    siteName: "WanWalk",
    locale: "ja_JP",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "WanWalk - 愛犬との散歩コース",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE],
  },
  // iOS Safari の Smart App Banner（<meta name="apple-itunes-app">）。
  // インストール済みなら「開く」でアプリ起動、未インストールなら App Store へ。
  // app-id は AppStoreBadge.tsx の APP_STORE_URL(id6757466888) と同一値（SSoT）。
  // ここはサイト全体の基底（app-id のみ）。ルート詳細は generateMetadata 側で
  // app-argument（正規 URL）を付与し、インストール済み時に該当ルートへ直接遷移させる。
  itunes: { appId: "6757466888" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClassNames = `${inter.variable} ${notoSansJp.variable} ${notoSerifJp.variable}`;
  return (
    <html lang="ja" className={fontClassNames}>
      <head>
        {/* 画像ホストは self-host できないので preconnect は残す */}
        <link rel="preconnect" href="https://jkpenklhrlbctebkpvax.supabase.co" />
      </head>
      <body className="walks-root min-h-screen">
        {children}
        {GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());var __ww_internal=false;try{__ww_internal=localStorage.getItem('wanwalk_internal')==='true';}catch(e){}gtag('config', '${GA_ID}', __ww_internal?{traffic_type:'internal'}:{});`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
