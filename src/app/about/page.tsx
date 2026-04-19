import type { Metadata } from "next";
import Link from "next/link";
import { Path, MapPin, Dog, Camera } from "@phosphor-icons/react/dist/ssr";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";

export const metadata: Metadata = {
  title: "WanWalkについて - 愛犬との散歩をもっと豊かに",
  description:
    "WanWalkは、犬連れに特化した日本初の散歩ルート体験プラットフォームです。83本のルートと556件の犬連れスポットを、体験ストーリーと写真でお届けします。",
  openGraph: {
    title: "WanWalkについて",
    description:
      "犬連れに特化した日本初の散歩ルート体験プラットフォーム。",
  },
};

export default function AboutPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* パンくず */}
        <nav
          style={{
            fontSize: 13,
            color: "var(--color-ww-text-tertiary)",
            marginBottom: 32,
          }}
        >
          <Link href="/" style={{ color: "inherit" }}>
            トップ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--color-ww-text-secondary)" }}>
            WanWalkについて
          </span>
        </nav>

        <h1
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 36,
            fontWeight: 700,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.35,
            marginBottom: 16,
          }}
        >
          WanWalkについて
        </h1>

        <p
          style={{
            fontSize: 20,
            fontFamily: "var(--font-ww-serif)",
            fontWeight: 500,
            color: "var(--color-ww-accent)",
            lineHeight: 1.6,
            marginBottom: 40,
          }}
        >
          犬と一緒に歩くすべての時間を、もっと豊かにする。
        </p>

        {/* ミッション */}
        <section style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
            }}
          >
            WanWalkは、犬連れに特化した日本初の散歩ルート体験プラットフォームです。
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
              marginTop: 16,
            }}
          >
            「知らない土地で犬とどこを歩けばいいかわからない」
            — 多くの愛犬家が抱えるこの悩みに応えるために、
            WanWalkは生まれました。
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
              marginTop: 16,
            }}
          >
            犬と行ける場所を紹介するサービスは多数ありますが、
            犬と「散歩するルート」を体験ストーリー付きで紹介し、
            その中に犬連れOKスポットを豊富に内包するサービスは
            WanWalkだけです。
          </p>
        </section>

        {/* 数字で見るWanWalk */}
        <section style={{ marginBottom: 48 }}>
          <h2
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--color-ww-accent)",
              marginBottom: 24,
            }}
          >
            数字で見るWanWalk
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard icon={<Path size={24} weight="regular" />} value="83" label="散歩ルート" />
            <StatCard icon={<MapPin size={24} weight="regular" />} value="26" label="対応エリア" />
            <StatCard icon={<Dog size={24} weight="regular" />} value="556" label="犬連れスポット" />
            <StatCard icon={<Camera size={24} weight="regular" />} value="100%" label="体験ストーリー" />
          </div>
        </section>

        {/* WanWalkの特徴 */}
        <section style={{ marginBottom: 48 }}>
          <h2
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--color-ww-accent)",
              marginBottom: 24,
            }}
          >
            WanWalkの特徴
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <FeatureItem title="犬連れに完全特化">
              全ルート・全スポットに犬連れ情報（犬種制限・リード要否・テラス席の有無・カート走行可否）を記載。
              愛犬と安心してお出かけできる情報を提供します。
            </FeatureItem>
            <FeatureItem title="体験ストーリーで伝える">
              単なるスポット情報ではなく、実際に歩いた体験をストーリーと写真で紹介。
              散歩コースの空気感をそのままお届けします。
            </FeatureItem>
            <FeatureItem title="実用的なルート設計">
              駐車場スタート・駐車場ゴールが基本。
              犬連れの飼い主が車で来て、散歩して、車で帰ることを前提に設計しています。
            </FeatureItem>
            <FeatureItem title="箱根DMOサポート">
              箱根DMO（箱根町観光協会）のサポートのもと、
              箱根エリアを中心に高品質なルート情報を提供しています。
            </FeatureItem>
          </ul>
        </section>

        {/* 対応エリア */}
        <section style={{ marginBottom: 48 }}>
          <h2
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--color-ww-accent)",
              marginBottom: 16,
            }}
          >
            対応エリア
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            箱根（芦ノ湖・仙石原・強羅・宮ノ下・湯本）・鎌倉・横浜・伊豆・軽井沢・河口湖・三浦半島・湘南・秩父・日光・那須・草津・東京 他、全26エリアに対応。
            順次拡大中です。
          </p>
          <Link
            href="/areas"
            className="inline-flex items-center gap-2 mt-4 transition-colors"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-ww-accent)",
            }}
          >
            エリア一覧を見る →
          </Link>
        </section>

        <div className="py-8">
          <WalksAppCTA />
        </div>

        {/* 運営情報（控えめに下部） */}
        <section
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--color-ww-border-subtle)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--color-ww-text-tertiary)",
              lineHeight: 1.8,
            }}
          >
            WanWalkは、箱根仙石原で犬のホテル&カフェ「DogHub」を運営するDogHub株式会社が提供しています。
            実店舗での犬の散歩案内の経験をもとに、全国の犬連れ散歩ルートを体験ストーリー付きで紹介しています。
          </p>
        </section>

        <SupportedBadge />
      </div>

      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "WanWalk",
            url: "https://wanwalk.jp",
            description:
              "犬連れに特化した日本初の散歩ルート体験プラットフォーム",
            parentOrganization: {
              "@type": "Organization",
              name: "DogHub株式会社",
              url: "https://dog-hub.shop",
            },
          }),
        }}
      />
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="text-center"
      style={{
        padding: 20,
        backgroundColor: "var(--color-ww-bg-secondary)",
        borderRadius: "var(--radius-ww-md)",
      }}
    >
      <div
        className="inline-flex items-center justify-center mb-3"
        style={{ color: "var(--color-ww-accent)" }}
      >
        {icon}
      </div>
      <p
        className="ww-numeric"
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "var(--color-ww-accent)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 12,
          color: "var(--color-ww-text-secondary)",
          marginTop: 4,
        }}
      >
        {label}
      </p>
    </div>
  );
}

function FeatureItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li style={{ marginBottom: 20 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          marginBottom: 4,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: "var(--color-ww-text-secondary)",
        }}
      >
        {children}
      </p>
    </li>
  );
}
