import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import { getAllNewsArticles, formatPublishedDate } from "@/lib/news";

// 完全静的: MDXファイルを読むだけなのでビルド時固定
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "お知らせ - WanWalkの最新情報",
  description:
    "WanWalkの公開・新機能・取り組みなど、最新情報をお届けします。",
  alternates: { canonical: "/news" },
  ...buildOgMetadata({
    title: "お知らせ",
    description: "WanWalkの公開・新機能・取り組みなど、最新情報をお届けします。",
    path: "/news",
    ogImageAlt: "WanWalk お知らせ",
  }),
};

export default async function NewsIndexPage() {
  const articles = await getAllNewsArticles();

  return (
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
        <span style={{ color: "var(--color-ww-text-secondary)" }}>お知らせ</span>
      </nav>

      <div className="flex items-center mb-4">
        <span
          className="inline-block mr-3"
          style={{
            width: 24,
            height: 1,
            backgroundColor: "var(--color-ww-border-subtle)",
          }}
          aria-hidden
        />
        <h1
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 36,
            fontWeight: 700,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.35,
          }}
        >
          お知らせ
        </h1>
      </div>

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.85,
          color: "var(--color-ww-text-secondary)",
          marginBottom: 48,
        }}
      >
        WanWalkの公開・新機能・取り組みなど、最新情報をお届けします。
      </p>

      {articles.length === 0 ? (
        <p
          style={{
            fontSize: 14,
            color: "var(--color-ww-text-tertiary)",
            textAlign: "center",
            padding: "48px 0",
          }}
        >
          現在お知らせはありません。
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {articles.map((article) => (
            <li
              key={article.slug}
              style={{
                borderTop: "1px solid var(--color-ww-border-subtle)",
                paddingTop: 32,
                paddingBottom: 32,
              }}
            >
              <Link
                href={`/news/${article.slug}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                    fontSize: 12,
                    color: "var(--color-ww-text-tertiary)",
                    letterSpacing: "0.05em",
                  }}
                >
                  <time dateTime={article.publishedAt}>
                    {formatPublishedDate(article.publishedAt)}
                  </time>
                  <span
                    style={{
                      padding: "2px 8px",
                      border: "1px solid var(--color-ww-border-subtle)",
                      borderRadius: 2,
                      color: "var(--color-ww-text-secondary)",
                    }}
                  >
                    {article.category}
                  </span>
                </div>
                <h2
                  className="ww-serif"
                  style={{
                    fontFamily: "var(--font-ww-serif)",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "var(--color-ww-text)",
                    lineHeight: 1.55,
                    marginBottom: 8,
                  }}
                >
                  {article.title}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.85,
                    color: "var(--color-ww-text-secondary)",
                    marginBottom: 12,
                  }}
                >
                  {article.description}
                </p>
                <span
                  className="inline-flex items-center gap-1"
                  style={{
                    fontSize: 13,
                    color: "var(--color-ww-accent)",
                    fontWeight: 500,
                  }}
                >
                  続きを読む
                  <ArrowRight size={14} weight="regular" />
                </span>
              </Link>
            </li>
          ))}
          <li
            style={{
              borderTop: "1px solid var(--color-ww-border-subtle)",
              height: 0,
            }}
          />
        </ul>
      )}
    </div>
  );
}
