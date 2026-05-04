import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Path, Camera, DeviceMobile, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import {
  getAreasWithRouteCount,
  getFeaturedRoute,
  getFeaturedRoutesForTop,
} from "@/lib/walks/data";
import RouteCard from "@/components/walks/RouteCard";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "次の休日、どこ歩く？ 愛犬との散歩コース | WanWalk",
  description:
    "箱根・鎌倉・伊豆など、愛犬と歩きたくなる散歩コースを厳選。駐車場・犬可カフェ・トイレ情報も完備。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "次の休日、どこ歩く？ | WanWalk",
    description: "箱根・鎌倉・伊豆…愛犬と歩きたくなる散歩コースを厳選。",
    images: [
      {
        url: "https://jkpenklhrlbctebkpvax.supabase.co/storage/v1/render/image/public/route-photos/yamanakako-lakeside/refetch_20260422/01.jpg?width=1200&height=630&resize=cover&quality=80",
        width: 1200,
        height: 630,
        alt: "WanWalk - 愛犬との散歩コース",
      },
    ],
  },
};

// Wildbounds流セクション見出し（hairline装飾線 + Noto Serif JP）
function SectionHeading({
  title,
  seeAllHref,
}: {
  title: string;
  seeAllHref?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div className="flex items-center">
        <span
          className="inline-block mr-3"
          style={{
            width: 24,
            height: 1,
            backgroundColor: "var(--color-ww-border-subtle)",
          }}
          aria-hidden
        />
        <h2
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: "var(--color-ww-accent)",
            lineHeight: 1.4,
          }}
        >
          {title}
        </h2>
      </div>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="inline-flex items-center gap-1 group transition-colors"
          style={{
            fontSize: 12,
            color: "var(--color-ww-text-secondary)",
            letterSpacing: "0.03em",
          }}
        >
          <span>すべて見る</span>
          <ArrowRight size={14} weight="regular" />
        </Link>
      )}
    </div>
  );
}

export default async function WalksTopPage() {
  const [areas, featuredRoutes, pickupRoute] = await Promise.all([
    getAreasWithRouteCount(),
    getFeaturedRoutesForTop(12),
    getFeaturedRoute(),
  ]);

  const activeAreas = areas.filter((a) => a.route_count > 0);
  const totalRoutes = activeAreas.reduce((sum, a) => sum + a.route_count, 0);
  const featuredAreas = [...activeAreas]
    .sort((a, b) => b.route_count - a.route_count)
    .slice(0, 8);

  return (
    <>
      {/* ヒーロー: KV + テキスト */}
      <section>
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          <Image
            src="https://jkpenklhrlbctebkpvax.supabase.co/storage/v1/object/public/route-photos/sengokuhara_susuki/01.jpg"
            alt="仙石原すすき草原と箱根の山々"
            fill
            priority
            className="object-cover object-[center_65%]"
            sizes="100vw"
          />
          {/* 下端フェード: 画像→背景色に自然に溶け込む */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{
              background:
                "linear-gradient(to top, var(--color-ww-bg-secondary), transparent)",
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "var(--color-ww-bg-secondary)",
          }}
          className="pb-16 pt-8"
        >
          <div className="max-w-6xl mx-auto px-4 text-center">
            {/* Branding: WanWalk + Supported by 箱根DMO（hairline区切り） */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span
                className="ww-serif"
                style={{
                  fontFamily: "var(--font-ww-serif)",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--color-ww-accent)",
                  letterSpacing: "0.04em",
                }}
              >
                WanWalk
              </span>
              <span
                aria-hidden
                style={{
                  width: 1,
                  height: 10,
                  backgroundColor: "var(--color-ww-border-subtle)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-ww-text-secondary)",
                  letterSpacing: "0.05em",
                }}
              >
                Supported by 箱根DMO
              </span>
            </div>

            <h1
              className="ww-serif"
              style={{
                fontFamily: "var(--font-ww-serif)",
                fontWeight: 700,
                color: "var(--color-ww-text)",
                letterSpacing: "0.01em",
                lineHeight: 1.3,
              }}
            >
              <span className="block text-3xl md:text-5xl mb-4">次の休日、どこ歩く？</span>
            </h1>

            <p
              style={{
                color: "var(--color-ww-text-secondary)",
                fontSize: 18,
                lineHeight: 1.75,
                maxWidth: 640,
                margin: "0 auto",
              }}
              className="md:text-xl"
            >
              箱根・鎌倉・伊豆…
              <br className="hidden md:inline" />
              愛犬と歩きたくなる散歩コースを厳選
            </p>

            <p
              className="mt-4"
              style={{
                fontSize: 13,
                lineHeight: 1.8,
                color: "var(--color-ww-text-tertiary)",
                letterSpacing: "0.02em",
              }}
            >
              駐車場・犬可カフェ・トイレ情報つき。体験ストーリーと写真で伝えます。
            </p>

            {/* 統計カード: 背景なし・境界線のみ・tabular-nums */}
            <div className="flex items-center justify-center gap-8 md:gap-12 mt-10 mb-10">
              <StatItem value={totalRoutes.toString()} label="COURSES" />
              <StatDivider />
              <StatItem value={activeAreas.length.toString()} label="AREAS" />
              <StatDivider />
              <StatItem value="ALL" label="DOG FRIENDLY" />
            </div>

            {/* CTA: 深緑塗り・rounded-md・max-w-xs */}
            <Link
              href="/areas"
              className="inline-flex items-center justify-center w-full max-w-xs h-12 transition-colors"
              style={{
                backgroundColor: "var(--color-ww-accent)",
                color: "var(--color-ww-text-inverse)",
                borderRadius: "var(--radius-ww-md)",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              エリアから探す
            </Link>
            <p
              className="mt-3"
              style={{
                fontSize: 12,
                color: "var(--color-ww-text-secondary)",
                letterSpacing: "0.04em",
              }}
            >
              <span className="ww-numeric">全{activeAreas.length}エリア</span>・
              <span className="ww-numeric">{totalRoutes}コース</span>
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* エリア一覧 */}
        <section className="py-12 md:py-16">
          <SectionHeading title="人気エリア" seeAllHref="/areas" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredAreas.map((area) => (
              <Link
                key={area.id}
                href={`/areas/${area.slug}`}
                className="group block transition-colors"
                style={{
                  backgroundColor: "var(--color-ww-bg-secondary)",
                  border: "1px solid var(--color-ww-border-subtle)",
                  borderRadius: "var(--radius-ww-md)",
                  padding: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-ww-sans)",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-ww-text)",
                    lineHeight: 1.5,
                  }}
                >
                  {area.name}
                </h3>
                <p
                  className="mt-1"
                  style={{
                    fontSize: 12,
                    color: "var(--color-ww-text-secondary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {area.prefecture} ・ <span className="ww-numeric">{area.route_count}</span>コース
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* おすすめピックアップ */}
        {pickupRoute && (
          <section className="py-12 md:py-16">
            <SectionHeading title="おすすめピックアップ" />
            <Link
              href={`/routes/${pickupRoute.slug}`}
              className="group block overflow-hidden transition-colors"
              style={{
                border: "1px solid var(--color-ww-border-subtle)",
                borderRadius: "var(--radius-ww-md)",
                backgroundColor: "var(--color-ww-bg)",
              }}
            >
              {pickupRoute.thumbnail_url && (
                <div className="aspect-[21/9] relative">
                  <Image
                    src={pickupRoute.thumbnail_url}
                    alt={pickupRoute.name}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 1152px) 100vw, 1152px"
                  />
                </div>
              )}
              <div className="p-6">
                <h3
                  className="ww-serif"
                  style={{
                    fontFamily: "var(--font-ww-serif)",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "var(--color-ww-text)",
                    letterSpacing: "0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  {pickupRoute.name}
                </h3>
                <div
                  className="flex items-center flex-wrap gap-4 mt-3"
                  style={{
                    fontSize: 13,
                    color: "var(--color-ww-text-secondary)",
                  }}
                >
                  <span className="ww-numeric">
                    {(pickupRoute.distance_meters / 1000).toFixed(1)}km
                  </span>
                  <span>約<span className="ww-numeric">{pickupRoute.estimated_minutes}</span>分</span>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: "var(--radius-ww-sm)",
                      backgroundColor: "var(--color-ww-accent-soft)",
                      color: "var(--color-ww-accent)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {pickupRoute.areas?.name}
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* 注目の散歩コース（12件・エリア多様性ピックアップ）*/}
        <section className="py-12 md:py-16">
          <SectionHeading title="注目の散歩コース" seeAllHref="/routes" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 transition-colors"
              style={{
                fontSize: 14,
                color: "var(--color-ww-accent)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                borderBottom: "1px solid var(--color-ww-accent)",
                paddingBottom: 2,
              }}
            >
              すべての散歩コース（<span className="ww-numeric">{totalRoutes}</span>件）を見る
              <ArrowRight size={14} weight="regular" />
            </Link>
          </div>
        </section>

        {/* WanWalkとは */}
        <section className="py-12 md:py-16">
          <div className="flex items-center justify-center mb-10">
            <span
              className="inline-block mr-3"
              style={{
                width: 24,
                height: 1,
                backgroundColor: "var(--color-ww-border-subtle)",
              }}
              aria-hidden
            />
            <h2
              className="ww-serif"
              style={{
                fontFamily: "var(--font-ww-serif)",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: "var(--color-ww-accent)",
                lineHeight: 1.4,
              }}
            >
              WanWalkとは？
            </h2>
            <span
              className="inline-block ml-3"
              style={{
                width: 24,
                height: 1,
                backgroundColor: "var(--color-ww-border-subtle)",
              }}
              aria-hidden
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            <FeaturePillar
              icon={<Path size={28} weight="regular" />}
              title="愛犬と歩く専門コース"
              body="駐車場・トイレ・犬可カフェなど、愛犬と出かけるのに必要な情報を完備。"
            />
            <FeaturePillar
              icon={<Camera size={28} weight="regular" />}
              title="写真で体験を伝える"
              body="実際に歩いた人の写真と体験で、コースの空気感をそのままお届けします。"
            />
            <FeaturePillar
              icon={<DeviceMobile size={28} weight="regular" />}
              title="アプリで記録（近日）"
              body="WanWalkアプリならGPSで散歩を自動記録。歩いたルートをそのまま残せます。"
            />
          </div>
        </section>

        <div className="py-12 md:py-16">
          <WalksAppCTA />
        </div>

        <SupportedBadge />
      </div>

      {/* ItemList 構造化データは /routes 一覧ページに移行済み */}

      {/* FAQ構造化データ（GEO/AIO最適化） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "WanWalkとは何ですか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "WanWalkは、犬連れに特化した日本初の散歩ルート体験プラットフォームです。箱根・鎌倉・伊豆など全国26エリアで、83本の散歩ルートと556件の犬連れスポットを体験ストーリー付きで紹介しています。",
                },
              },
              {
                "@type": "Question",
                name: "愛犬と散歩できるルートはいくつありますか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `現在${totalRoutes}本の犬連れ散歩ルートを掲載しています。すべてのルートに体験ストーリー、犬連れ情報、季節情報が完備されています。`,
                },
              },
              {
                "@type": "Question",
                name: "どのエリアに対応していますか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `全${activeAreas.length}エリアに対応しています。箱根（芦ノ湖・仙石原・強羅・宮ノ下・湯本）、鎌倉、横浜、伊豆、軽井沢、河口湖、三浦半島、湘南、秩父など。順次拡大中です。`,
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p
        className="ww-numeric"
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 30,
          fontWeight: 600,
          color: "var(--color-ww-accent)",
          lineHeight: 1.1,
          letterSpacing: "0.01em",
        }}
      >
        {value}
      </p>
      <p
        className="mt-2"
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--color-ww-text-tertiary)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function StatDivider() {
  return (
    <span
      aria-hidden
      style={{
        width: 1,
        height: 36,
        backgroundColor: "var(--color-ww-border-subtle)",
        display: "inline-block",
      }}
    />
  );
}

function FeaturePillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center">
      <div
        className="inline-flex items-center justify-center mb-5"
        style={{
          width: 56,
          height: 56,
          color: "var(--color-ww-accent)",
          borderBottom: "1px solid var(--color-ww-border-subtle)",
          paddingBottom: 8,
        }}
      >
        {icon}
      </div>
      <h3
        className="mb-3"
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 16,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.75,
          color: "var(--color-ww-text-secondary)",
        }}
      >
        {body}
      </p>
    </div>
  );
}
