import type { Metadata } from "next";
import Link from "next/link";
import { Path, MapPin, Dog, Camera } from "@phosphor-icons/react/dist/ssr";
import SupportedBadge from "@/components/walks/SupportedBadge";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import { getSiteStats } from "@/lib/walks/stats";

// ISR: 24時間ごとに再検証（件数を getSiteStats で集計するため force-static から変更）
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const { routeCount, spotCount } = await getSiteStats();
  return {
    title: "WanWalkについて - 愛犬との散歩をもっと豊かに",
    description: `WanWalkは、犬連れに特化した日本初の散歩ルート体験プラットフォームです。${routeCount}本のルートと${spotCount}件の犬連れスポットを、体験ストーリーと写真でお届けします。`,
    alternates: { canonical: "/about" },
    ...buildOgMetadata({
      title: "WanWalkについて",
      description: "犬連れに特化した日本初の散歩ルート体験プラットフォーム。",
      path: "/about",
      ogImageAlt: "WanWalkについて",
    }),
  };
}

export default async function AboutPage() {
  const { routeCount, areaCount, spotCount, avgStoryLength } = await getSiteStats();
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
            <StatCard icon={<Path size={24} weight="regular" />} value={String(routeCount)} label="散歩ルート" />
            <StatCard icon={<MapPin size={24} weight="regular" />} value={String(areaCount)} label="対応エリア" />
            <StatCard icon={<Dog size={24} weight="regular" />} value={String(spotCount)} label="犬連れスポット" />
            <StatCard icon={<Camera size={24} weight="regular" />} value={String(avgStoryLength)} label="平均ストーリー字数" />
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-ww-text-tertiary)",
              marginTop: 12,
              textAlign: "right",
            }}
          >
            ※ 2026年5月時点
          </p>
        </section>

        {/* 実体験ベースの精査実績（E-E-A-T シグナル） */}
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
            実体験ベースで精査しています
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
              marginBottom: 16,
            }}
          >
            WanWalkの公開ルートは、テンプレート記事ではありません。
            DogHub箱根仙石原でスタッフが愛犬家のお客様に実際にご案内してきた経験を起点に、
            一本ずつ写真と座標、犬連れ実用情報を確認しながら整備しています。
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <FeatureItem title={`体験ストーリー 全${routeCount}ルートに収録（平均${avgStoryLength}字）`}>
              全ルートに、駐車場の入り方・路面の状態・足元の注意点・愛犬と立ち寄れるカフェやベンチまで、
              散歩の流れに沿って書いたストーリーを掲載しています。
            </FeatureItem>
            <FeatureItem title="犬連れ実用情報 100%充填">
              全{routeCount}ルートでカート走行可否（cart_friendly）と
              主要カテゴリのスポット（カフェ・レストラン・ドッグラン・ショップ）に
              犬連れポリシー（テラス可否・リード要否・サイズ制限）を100%付与しています。
            </FeatureItem>
            <FeatureItem title="座標・写真・Place ID 精査 50ルート以上完了">
              2026年4月以降、50ルート以上を一本ずつ精査。
              スポット座標のずれ、写真の主題ミスマッチ、Place ID 誤マッチを
              Google Places API と現地データで突き合わせて訂正しています。
            </FeatureItem>
            <FeatureItem title="pet_friendly フラグ訂正 49件（2026年5月時点）">
              公式FAQ・第三者複数ソース・実訪問者口コミの3段検証で、
              「犬OKなのに犬不可と表示されていた」「犬不可なのに犬OKと表示されていた」を
              一件ずつ整合化。情報の正確性を継続的に高めています。
            </FeatureItem>
          </ul>
        </section>

        {/* WanWalkのルートはこう作られています（ラベル凡例＋掲載異議窓口・決定8） */}
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
            WanWalkのルートはこう作られています
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
              marginBottom: 16,
            }}
          >
            WanWalkのルートには、2つの出所があります。ひとつは、DogHubの案内経験をもとに
            編集部が整備する<strong>公式ルート</strong>。もうひとつは、実際に愛犬と歩いた方の
            推薦を編集部が確認して掲載する<strong>投稿ルート</strong>です。
            どちらのルートにも、確認のレベルを示すバッジを添えています。
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <FeatureItem title="机上確認">
              編集部が資料・地図で確認して掲載しています。編集部による現地の再訪はしていません。
            </FeatureItem>
            <FeatureItem title="実走報告あり">
              実際にそのルートを歩いた方の報告をもとに掲載・更新しています。
              報告があったルートには「◯◯さんの実走報告により更新」と最終実走の月を表示します。
            </FeatureItem>
            <FeatureItem title="現地確認済み">
              編集部が現地で確認して掲載しています。
            </FeatureItem>
          </ul>

          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            掲載内容へのご指摘・異議
          </h3>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.9,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            写真への写り込みに限らず、通行の可否、私有地・生活道路の掲載など、掲載内容に関するご指摘や
            異議を受け付けています。ご連絡をいただいた場合は、事実確認が完了するまでの間、当該ルートを
            一時的に非公開とすることがあります。
            <br />
            ご連絡は{" "}
            <a
              href="mailto:info@dog-hub.shop?subject=WanWalk%20掲載内容へのご指摘"
              style={{ color: "var(--color-ww-accent)", fontWeight: 500 }}
            >
              info@dog-hub.shop
            </a>{" "}
            までお願いします。
          </p>
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
              単なるスポット情報ではなく、散歩コースの流れと犬連れ実用情報をストーリーと写真で紹介。
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
            箱根（芦ノ湖・仙石原・強羅・宮ノ下・湯本）・鎌倉・横浜・伊豆・軽井沢・河口湖・三浦半島・湘南・秩父・日光・那須・草津・東京 他、全{areaCount}エリアに対応。
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
          <WalksAppCTA sourcePage="about" />
        </div>

        {/* WanWalkが生まれた理由 */}
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
            WanWalkが生まれた理由
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
            }}
          >
            箱根仙石原で犬のホテル&カフェ「DogHub」を運営する中で、
            愛犬と旅行に来られたお客様から何度も同じ相談を受けました。
          </p>
          <blockquote
            style={{
              margin: "24px 0",
              padding: "20px 24px",
              borderLeft: "3px solid var(--color-ww-accent)",
              backgroundColor: "var(--color-ww-bg-secondary)",
              borderRadius: "0 var(--radius-ww-sm) var(--radius-ww-sm) 0",
              fontSize: 16,
              lineHeight: 1.8,
              color: "var(--color-ww-text)",
              fontStyle: "italic",
            }}
          >
            「この辺りで、犬と一緒に歩ける散歩ルートはありますか？」
          </blockquote>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
              marginTop: 16,
            }}
          >
            普段の散歩なら道に迷うことはありません。
            でも、旅先やお出かけ先では話が違います。
            犬と一緒に安心して歩けるルートがどこにあるのか、
            道の状態はどうか、トイレや水飲み場はあるか。
            そうした情報は、どこを探しても見つかりません。
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
              marginTop: 16,
            }}
          >
            スタッフが景色の良い散歩ルートをご案内すると、
            お客様はとても喜んでくださいました。
            この体験を、箱根だけでなく全国の愛犬家に届けたい。
            そう考えて生まれたのがWanWalkです。
          </p>
        </section>

        {/* 運営情報 */}
        <section
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--color-ww-border-subtle)",
          }}
        >
          <h2
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              marginBottom: 16,
            }}
          >
            運営
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-ww-text-secondary)",
              lineHeight: 1.8,
            }}
          >
            DogHub箱根仙石原
          </p>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-ww-text-secondary)",
              lineHeight: 1.8,
              marginTop: 4,
            }}
          >
            犬のホテル&カフェ「DogHub箱根仙石原」を運営。
            実店舗での犬の散歩案内の経験をもとに、
            全国の犬連れ散歩ルートを体験ストーリー付きで紹介しています。
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 mt-6 transition-colors"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-ww-accent)",
            }}
          >
            お知らせ一覧を見る →
          </Link>
        </section>

        <SupportedBadge />
      </div>

      {/* Organization JSON-LD（E-E-A-T シグナル強化版） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://wanwalk.jp/#organization",
            name: "WanWalk",
            alternateName: "ワンウォーク",
            url: "https://wanwalk.jp",
            description: `犬連れに特化した日本初の散歩ルート体験プラットフォーム。全${routeCount}ルート・${spotCount}件の犬連れスポットを、体験ストーリーと写真でお届けする。`,
            knowsAbout: [
              "犬連れ散歩",
              "犬連れ旅行",
              "愛犬家旅行",
              "散歩ルート",
              "ペットフレンドリースポット",
              "犬連れカフェ",
              "ドッグラン",
              "犬連れ観光",
            ],
            areaServed: {
              "@type": "Country",
              name: "Japan",
            },
            parentOrganization: {
              "@type": "Organization",
              "@id": "https://dog-hub.shop/#organization",
              name: "DogHub箱根仙石原",
              alternateName: "DogHub",
              url: "https://dog-hub.shop",
              description:
                "箱根仙石原で犬のホテル&カフェ「DogHub」を運営。愛犬家のお客様の声をもとにWanWalkを開発。",
            },
            sameAs: ["https://dog-hub.shop"],
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
