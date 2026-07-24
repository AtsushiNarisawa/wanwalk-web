import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Tree,
  Dog,
  Binoculars,
  CheckCircle,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { getSpotsByCategory } from "@/lib/walks/data";
import SupportedBadge from "@/components/walks/SupportedBadge";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import { buildOgMetadata } from "@/lib/walks/og-meta";

// ISR: 24時間
export const revalidate = 86400;

// SEO 対象カテゴリのみ。ここに無いカテゴリは notFound() で 404。
const ALLOWED_CATEGORIES = ["viewpoint", "park", "dog_run"] as const;
type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

const CATEGORY_META: Record<
  AllowedCategory,
  { icon: Icon; label: string; tagline: string; metaDescription: string }
> = {
  viewpoint: {
    icon: Binoculars,
    label: "景観ポイント",
    tagline: "絶景・展望台・撮影スポット",
    metaDescription:
      "愛犬と歩きながら立ち寄れる絶景ポイントを全国から紹介。海・山・湖・夜景まで、犬連れでアクセスしやすい景観スポットの一覧。",
  },
  park: {
    icon: Tree,
    label: "公園・自然",
    tagline: "広場・芝生・木陰の散歩道",
    metaDescription:
      "犬連れで散歩できる公園・自然エリア。芝生広場・遊歩道・木陰の多いコースをエリア別に紹介します。",
  },
  dog_run: {
    icon: Dog,
    label: "ドッグラン",
    tagline: "リードを外して走れるエリア",
    metaDescription:
      "リードを外して愛犬を走らせられるドッグラン一覧。利用条件・小型犬エリアの有無もスポットページで確認できます。",
  },
};

const PER_PAGE = 30;

export async function generateStaticParams() {
  return ALLOWED_CATEGORIES.map((category) => ({ category }));
}

function parseCategoryParam(raw: string): AllowedCategory | null {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as AllowedCategory)
    : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = parseCategoryParam(category);
  if (!cat) return {};

  const sp = await searchParams;
  const pageNum = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const meta = CATEGORY_META[cat];
  const spots = await getSpotsByCategory(cat);
  const total = spots.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(pageNum, totalPages);

  const pageSuffix = safePage > 1 ? ` (${safePage}/${totalPages}ページ)` : "";
  const title = `${meta.label}一覧 ${total}件｜犬連れスポット${pageSuffix}`;
  const description = meta.metaDescription;
  // ページネーション付き URL の canonical は page=1 と page=N で分ける
  const canonicalPath =
    safePage === 1
      ? `/spots/category/${cat}`
      : `/spots/category/${cat}?page=${safePage}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    // page > 1 はインデックスしないでクロウラには follow させる（重複コンテンツ回避）
    robots:
      safePage > 1
        ? { index: false, follow: true }
        : undefined,
    ...buildOgMetadata({
      title: `${title} | WanWalk`,
      description,
      path: canonicalPath,
      ogImageAlt: `${meta.label} ${total}件 | WanWalk`,
    }),
  };
}

export default async function SpotsCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const cat = parseCategoryParam(category);
  if (!cat) notFound();

  const sp = await searchParams;
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const meta = CATEGORY_META[cat];
  const allSpots = await getSpotsByCategory(cat);
  const total = allSpots.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(requestedPage, totalPages);
  const startIdx = (safePage - 1) * PER_PAGE;
  const visibleSpots = allSpots.slice(startIdx, startIdx + PER_PAGE);

  const CatIcon = meta.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* パンくず */}
      <nav className="ww-breadcrumb">
        <Link href="/" className="ww-breadcrumb-link">
          トップ
        </Link>
        <span className="ww-breadcrumb-sep">/</span>
        <Link href="/spots" className="ww-breadcrumb-link">
          スポット一覧
        </Link>
        <span className="ww-breadcrumb-sep">/</span>
        <span className="ww-breadcrumb-current">{meta.label}</span>
      </nav>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <CatIcon size={28} weight="regular" style={{ color: "var(--color-ww-accent)" }} />
        <h1 className="ww-h1" style={{ marginBottom: 0 }}>
          {meta.label} <span className="ww-numeric">{total}</span>件
        </h1>
      </div>
      <p className="ww-lead">{meta.tagline}。愛犬と歩けるスポットを一覧で。</p>

      {/* スポット一覧（PER_PAGE件） */}
      {visibleSpots.length === 0 ? (
        <p className="ww-section-lead">スポットが見つかりませんでした。</p>
      ) : (
        <ul className="ww-spot-list">
          {visibleSpots.map((s) => (
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
                <span className="ww-spot-route">{s.route_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <nav className="ww-pagination" aria-label="ページネーション">
          {safePage > 1 && (
            <Link
              href={
                safePage - 1 === 1
                  ? `/spots/category/${cat}`
                  : `/spots/category/${cat}?page=${safePage - 1}`
              }
              className="ww-pagination-link"
              rel="prev"
            >
              ‹ 前へ
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // ページ番号は当ページ前後 2 個 + 先頭・末尾 で省略表示
            const show =
              p === 1 ||
              p === totalPages ||
              Math.abs(p - safePage) <= 2;
            if (!show) {
              if (p === 2 || p === totalPages - 1) {
                return (
                  <span key={`gap-${p}`} className="ww-pagination-ellipsis">
                    …
                  </span>
                );
              }
              return null;
            }
            if (p === safePage) {
              return (
                <span key={p} className="ww-pagination-current" aria-current="page">
                  {p}
                </span>
              );
            }
            return (
              <Link
                key={p}
                href={
                  p === 1
                    ? `/spots/category/${cat}`
                    : `/spots/category/${cat}?page=${p}`
                }
                className="ww-pagination-link"
              >
                {p}
              </Link>
            );
          })}
          {safePage < totalPages && (
            <Link
              href={`/spots/category/${cat}?page=${safePage + 1}`}
              className="ww-pagination-link"
              rel="next"
            >
              次へ ›
            </Link>
          )}
        </nav>
      )}

      <div className="py-8">
        <WalksAppCTA sourcePage="spots_category" />
      </div>

      <SupportedBadge />

      {/* JSON-LD: カテゴリ全件 ItemList。クロウラには全件 visibility を維持し、
          可視 DOM は PER_PAGE 件に絞ることで HTML サイズを抑える。 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `WanWalk ${meta.label}一覧`,
            description: meta.metaDescription,
            numberOfItems: total,
            itemListElement: allSpots.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://wanwalk.jp/spots/${s.slug}`,
              name: s.name,
            })),
          }),
        }}
      />

      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "トップ", item: "https://wanwalk.jp/" },
              { "@type": "ListItem", position: 2, name: "スポット一覧", item: "https://wanwalk.jp/spots" },
              { "@type": "ListItem", position: 3, name: meta.label, item: `https://wanwalk.jp/spots/category/${cat}` },
            ],
          }),
        }}
      />
    </div>
  );
}
