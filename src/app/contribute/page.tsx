import type { Metadata } from "next";
import Link from "next/link";
import { Path, MapPin, SealCheck } from "@phosphor-icons/react/dist/ssr";
import SupportedBadge from "@/components/walks/SupportedBadge";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import { getSiteStats } from "@/lib/walks/stats";

// 常設の募集ページ（決定4/9）。締切のない資産ページ。季節が変わってもパスは使い回す（/contribute 固定）。
//
// 公開段取り（2026-07-22 CEO 判断）: v1 配信までは noindex＋nav未リンクで待機し、配信日に
// index 化＋nav リンク＋アプリDL CTA（CTA復活）を一斉に有効化する。
// → 本ファイルでは robots:noindex を付与し、アプリDL CTA はまだ設置しない（休眠アプリへ誘導しない原則）。
// → sitemap.ts にも未登録（配信時に staticPages へ追加する）。
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  // 二層運用（決定9）: 表示コピーは情緒語、SEO タイトルは具体語で受ける。
  const title = "愛犬と歩いた道を教えてください｜銀杏並木・落ち葉・夕暮れの散歩道の推薦";
  const description =
    "実際に愛犬と歩いた近所の散歩道を推薦してください。WanWalk編集部が確認し、体験ストーリーとして掲載します。この秋、愛犬と歩きたくなった道を募集しています。";
  return {
    title,
    description,
    // v1 配信までは検索露出させない（配信日に解除）。
    robots: { index: false, follow: false },
    alternates: { canonical: "/contribute" },
    ...buildOgMetadata({
      title: "愛犬と歩いた道を、次の誰かへ",
      description,
      path: "/contribute",
      ogImageAlt: "愛犬と歩いた道の推薦募集",
    }),
  };
}

export default async function ContributePage() {
  const { routeCount } = await getSiteStats();
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
            道を教える
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
            marginBottom: 20,
          }}
        >
          愛犬と歩いた道を、次の誰かへ
        </h1>

        {/* 循環型の親コピー（決定14） */}
        <p
          style={{
            fontSize: 19,
            fontFamily: "var(--font-ww-serif)",
            fontWeight: 500,
            color: "var(--color-ww-accent)",
            lineHeight: 1.75,
            marginBottom: 40,
          }}
        >
          誰かが愛犬と歩いた道が、編集部の確認を経て、次の誰かの道になる。
          あなたが歩いた道も、そこに加われます。
        </p>

        {/* 初回テーマ（情緒語・決定9） */}
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
            いま教えてほしい道
          </h2>
          <p
            style={{
              fontSize: 20,
              fontFamily: "var(--font-ww-serif)",
              fontWeight: 500,
              color: "var(--color-ww-text)",
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            秋、愛犬と歩きたくなった近所の道。
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
            }}
          >
            銀杏並木、落ち葉を踏む音、夕暮れが少し早くなった帰り道。
            遠くの名所ではなく、いつもの散歩コースで構いません。
            この季節、愛犬と歩いていて心地よかった近所の道を教えてください。
          </p>
        </section>

        {/* 推薦の流れ */}
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
            推薦から掲載までの流れ
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <StepItem
              icon={<Path size={22} weight="regular" />}
              step="1"
              title="いつものように、愛犬と歩く"
            >
              特別な準備は要りません。ふだんの散歩がそのまま推薦のもとになります。
            </StepItem>
            <StepItem
              icon={<MapPin size={22} weight="regular" />}
              step="2"
              title="その道を推薦する"
            >
              歩いた道と、おすすめの理由、写真を添えて推薦します。
              発着点は自動で加工され、ご自宅や駐車場が分かる元の軌跡は公開されません。
            </StepItem>
            <StepItem
              icon={<SealCheck size={22} weight="regular" />}
              step="3"
              title="編集部が確認して掲載する"
            >
              WanWalk編集部が内容を確認し、体験ストーリーとして掲載します。
              掲載されたルートには、確認のレベルを示すバッジが添えられます。
            </StepItem>
          </ul>
        </section>

        {/* 掲載されると */}
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
            掲載されると
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: "var(--color-ww-text)",
            }}
          >
            推薦してくださった方には、希望に応じて「この道の守り人」としてお名前を添えます。
            その後にそのルートを歩いた方から実走報告が届くと、
            「◯◯さんの実走報告により更新」として最終実走の月がページに記録されます。
            あなたのなじみの道が、これから歩く誰かの道になっていきます。
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.9,
              color: "var(--color-ww-text-secondary)",
              marginTop: 16,
            }}
          >
            すでに全{routeCount}本のルートを公開しています。推薦は18歳以上の方に限らせていただきます。
            掲載の可否や内容は編集部の判断によります。
          </p>
        </section>

        {/* CTA（アプリDL・推薦導線）は v1 配信時に CTA復活で追加する（配信後ルール） */}

        <SupportedBadge />
      </div>
    </>
  );
}

function StepItem({
  icon,
  step,
  title,
  children,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li style={{ display: "flex", gap: 16, marginBottom: 24 }}>
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: "9999px",
          backgroundColor: "var(--color-ww-bg-secondary)",
          border: "1px solid var(--color-ww-border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-ww-accent)",
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            marginBottom: 4,
          }}
        >
          <span
            className="ww-numeric"
            style={{ color: "var(--color-ww-text-tertiary)", marginRight: 8 }}
          >
            {step}
          </span>
          {title}
        </h3>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.9,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          {children}
        </p>
      </div>
    </li>
  );
}
