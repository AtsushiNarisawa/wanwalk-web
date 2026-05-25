import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import {
  getAllNewsSlugs,
  getNewsMetadata,
  formatPublishedDate,
} from "@/lib/news";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getNewsMetadata(slug);
  if (!meta) return {};

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/news/${slug}` },
    ...buildOgMetadata({
      title: meta.title,
      description: meta.description,
      path: `/news/${slug}`,
      ogImage: meta.heroImage,
      ogImageAlt: meta.heroImageAlt ?? meta.title,
    }),
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const meta = await getNewsMetadata(slug);
  if (!meta) notFound();

  // Article モジュールを動的読み込み（MDX デフォルトエクスポート = React コンポーネント）
  const mod = await import(`@/content/news/${slug}.mdx`);
  const Article = mod.default as React.ComponentType;

  // BlogPosting JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    image: meta.heroImage ? [meta.heroImage] : undefined,
    datePublished: meta.publishedAt,
    dateModified: meta.publishedAt,
    author: {
      "@type": "Organization",
      name: "WanWalk 編集部",
      url: "https://wanwalk.jp/about",
    },
    publisher: {
      "@type": "Organization",
      name: "WanWalk",
      url: "https://wanwalk.jp",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://wanwalk.jp/news/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12">
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
          <Link href="/news" style={{ color: "inherit" }}>
            お知らせ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--color-ww-text-secondary)" }}>
            {meta.title}
          </span>
        </nav>

        {/* 日付 + カテゴリ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            fontSize: 12,
            color: "var(--color-ww-text-tertiary)",
            letterSpacing: "0.05em",
          }}
        >
          <time dateTime={meta.publishedAt}>
            {formatPublishedDate(meta.publishedAt)}
          </time>
          <span
            style={{
              padding: "2px 8px",
              border: "1px solid var(--color-ww-border-subtle)",
              borderRadius: 2,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            {meta.category}
          </span>
        </div>

        {/* タイトル */}
        <h1
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 32,
            fontWeight: 700,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.4,
            marginBottom: 32,
          }}
        >
          {meta.title}
        </h1>

        {/* Hero image */}
        {meta.heroImage && (
          <figure
            style={{
              margin: "0 0 40px 0",
              borderRadius: "var(--radius-ww-md)",
              overflow: "hidden",
              border: "1px solid var(--color-ww-border-subtle)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.heroImage}
              alt={meta.heroImageAlt ?? meta.title}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
              loading="eager"
              fetchPriority="high"
            />
          </figure>
        )}

        {/* 本文 */}
        <div>
          <Article />
        </div>

        {/* CTA */}
        <section
          className="text-center"
          style={{
            marginTop: 56,
            padding: "32px 24px",
            backgroundColor: "var(--color-ww-bg-secondary)",
            border: "1px solid var(--color-ww-border-subtle)",
            borderRadius: "var(--radius-ww-md)",
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "var(--color-ww-text-secondary)",
              marginBottom: 20,
              lineHeight: 1.85,
            }}
          >
            WanWalk は Web もアプリも完全無料です。
            <br />
            登録なしでルートの全情報をご覧いただけます。
          </p>
          <div
            className="flex flex-col sm:flex-row items-center justify-center"
            style={{ gap: 12 }}
          >
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-ww-text-inverse)",
                backgroundColor: "var(--color-ww-accent)",
                borderRadius: "var(--radius-ww-md)",
                textDecoration: "none",
              }}
            >
              ルートを見る
            </Link>
            <a
              href="https://apps.apple.com/jp/app/wanwalk/id6757466888"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-ww-accent)",
                backgroundColor: "transparent",
                border: "1px solid var(--color-ww-accent)",
                borderRadius: "var(--radius-ww-md)",
                textDecoration: "none",
              }}
            >
              App Store で見る
            </a>
          </div>
        </section>

        {/* 戻る */}
        <div style={{ marginTop: 48 }}>
          <Link
            href="/news"
            className="inline-flex items-center gap-1"
            style={{
              fontSize: 13,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            <ArrowLeft size={14} weight="regular" />
            お知らせ一覧に戻る
          </Link>
        </div>
      </article>
    </>
  );
}
