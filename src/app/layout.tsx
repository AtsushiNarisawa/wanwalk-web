import type { Metadata } from "next";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

export const metadata: Metadata = {
  metadataBase: new URL("https://wanwalk.jp"),
  title: {
    default: "WanWalk - 愛犬との散歩コース",
    template: "%s | WanWalk",
  },
  description: "箱根・鎌倉・伊豆…愛犬と歩きたくなる散歩コースを厳選。駐車場・犬可カフェ・トイレ情報つき。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
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
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
