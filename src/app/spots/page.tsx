import Link from "next/link";
import type { Metadata } from "next";
import {
  Tree,
  Dog,
  Binoculars,
  CheckCircle,
  MapPin,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { getSpotsListingSummary } from "@/lib/walks/data";
import type { SpotCategory } from "@/types/walks";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";
import { buildOgMetadata } from "@/lib/walks/og-meta";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

// SEO ランディング対象のカテゴリ。store/cafe/restaurant/parking 等の NON_SEO は表示しない。
const SEO_CATEGORIES = ["viewpoint", "park", "dog_run"] as const;
type SeoCategory = (typeof SEO_CATEGORIES)[number];

const CATEGORY_META: Record<
  SeoCategory,
  { icon: Icon; label: string; tagline: string }
> = {
  viewpoint: {
    icon: Binoculars,
    label: "景観ポイント",
    tagline: "絶景・展望台・撮影スポット",
  },
  park: {
    icon: Tree,
    label: "公園・自然",
    tagline: "広場・芝生・木陰の散歩道",
  },
  dog_run: {
    icon: Dog,
    label: "ドッグラン",
    tagline: "リードを外して走れるエリア",
  },
};

export const metadata: Metadata = {
  title: "犬連れスポット一覧｜景観・公園・ドッグラン",
  description:
    "WanWalk 編集部が歩いた全国の犬連れスポット。景観ポイント・公園・ドッグランをエリア別・カテゴリ別で探せます。",
  alternates: { canonical: "/spots" },
  ...buildOgMetadata({
    title: "犬連れスポット一覧｜景観・公園・ドッグラン | WanWalk",
    description:
      "全国の犬連れスポットをエリア・カテゴリで探す。景観・公園・ドッグランを地域別に紹介。",
    path: "/spots",
    ogImageAlt: "犬連れスポット一覧 | WanWalk",
  }),
};

export default async function SpotsHubPage() {
  const { total, byCategory, byArea, popular, allForItemList } =
    await getSpotsListingSummary(SEO_CATEGORIES as unknown as string[]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* パンくず */}
      <nav className="ww-breadcrumb">
        <Link href="/" className="ww-breadcrumb-link">
          トップ
        </Link>
        <span className="ww-breadcrumb-sep">/</span>
        <span className="ww-breadcrumb-current">スポット一覧</span>
      </nav>

      <h1 className="ww-h1">犬連れスポットを探す</h1>

      <p className="ww-lead">
        WanWalk 編集部が歩いた全国の犬連れスポット
        <span className="ww-numeric">{total}</span>件。
        景観ポイント・公園・ドッグランをエリア・カテゴリで探せます。
      </p>

      {/* カテゴリカード */}
      <section className="ww-section">
        <h2 className="ww-h2">カテゴリで探す</h2>
        <div className="ww-cat-grid">
          {SEO_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = byCategory[cat] ?? 0;
            if (count === 0) return null;
            const CatIcon = meta.icon;
            return (
              <Link
                key={cat}
                href={`/spots/category/${cat}`}
                className="ww-cat-card"
              >
                <div className="ww-cat-card-head">
                  <CatIcon
                    size={28}
                    weight="regular"
                    style={{ color: "var(--color-ww-accent)" }}
                  />
                  <div className="ww-cat-card-title-block">
                    <h3 className="ww-cat-card-title">{meta.label}</h3>
                    <p className="ww-cat-card-tagline">{meta.tagline}</p>
                  </div>
                </div>
                <div className="ww-cat-card-foot">
                  <span className="ww-numeric ww-cat-card-count">{count}</span>
                  <span className="ww-cat-card-cta">
                    一覧を見る <ArrowRight size={14} weight="regular" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* エリア別件数 */}
      <section className="ww-section">
        <h2 className="ww-h2">エリアで探す</h2>
        <p className="ww-section-lead">
          スポットの多い順。エリアページでルートと一緒に確認できます。
        </p>
        <div className="ww-area-chips">
          {byArea.map((a) => (
            <Link
              key={a.area_slug}
              href={`/areas/${a.area_slug}`}
              className="ww-area-chip"
            >
              {a.area_name}
              <span className="ww-numeric ww-area-chip-count">{a.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 人気スポット */}
      {popular.length > 0 && (
        <section className="ww-section">
          <h2 className="ww-h2">人気のスポット</h2>
          <p className="ww-section-lead">
            歩かれている回数が多いルートの代表スポット。
          </p>
          <ul className="ww-spot-list">
            {popular.map((s) => (
              <li key={s.id}>
                <Link href={`/spots/${s.slug}`} className="ww-spot-row-link">
                  <span className="ww-spot-name">{s.name}</span>
                  <span className="ww-spot-meta">
                    <span className="ww-spot-meta-item">
                      <MapPin size={12} weight="regular" />
                      {s.area_name}
                    </span>
                    {s.pet_friendly && (
                      <span className="ww-spot-meta-ok">
                        <CheckCircle size={12} weight="fill" />
                        犬連れOK
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="py-8">
        <WalksAppCTA />
      </div>
      <SupportedBadge />

      {/* JSON-LD ItemList（全件・AIO/Google向け）。
          HTMLの可視DOMには出さないが、構造化データとして全件を提供することで
          サイト規模の信頼性 + ロングテール clue を維持する。 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "WanWalk 犬連れスポット一覧",
            description:
              "WanWalk が掲載する全国の犬連れスポット（景観・公園・ドッグラン）",
            numberOfItems: total,
            itemListElement: allForItemList.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://wanwalk.jp/spots/${s.slug}`,
              name: s.name,
            })),
          }),
        }}
      />
    </div>
  );
}
