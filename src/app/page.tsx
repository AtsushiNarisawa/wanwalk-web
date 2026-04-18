import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Path, Camera, DeviceMobile, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getAreasWithRouteCount, getAllPublishedRoutes, getFeaturedRoute } from "@/lib/walks/data";
import SeasonFilter from "@/components/walks/SeasonFilter";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";

// ISR: 30分ごとに再検証
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "次の休日、どこ歩く？ 愛犬との散歩コース | WanWalk by DogHub",
  description:
    "箱根・鎌倉・伊豆など、愛犬と歩きたくなる散歩コースを厳選。駐車場・犬可カフェ・トイレ情報も完備。",
  openGraph: {
    title: "次の休日、どこ歩く？ | WanWalk",
    description: "箱根・鎌倉・伊豆…愛犬と歩きたくなる散歩コースを厳選。",
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
  const [areas, routes, pickupRoute] = await Promise.all([
    getAreasWithRouteCount(),
    getAllPublishedRoutes(),
    getFeaturedRoute(),
  ]);

  const activeAreas = areas.filter((a) => a.route_count > 0);
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
              <StatItem value={routes.length.toString()} label="COURSES" />
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
              <span className="ww-numeric">{routes.length}コース</span>
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

        {/* 散歩コース（季節フィルター付き） */}
        <section className="py-12 md:py-16">
          <SectionHeading title="散歩コース" />
          <SeasonFilter routes={routes} />
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

      {/* 構造化データ: ItemList（全ルート一覧） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "WanWalk 犬連れ散歩コース一覧",
            description:
              "箱根・鎌倉・伊豆など、愛犬と歩きたくなる散歩コースを厳選。",
            numberOfItems: routes.length,
            itemListElement: routes.map((route, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://wanwalk.jp/routes/${route.slug}`,
              name: route.name,
            })),
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
