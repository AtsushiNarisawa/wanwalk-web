import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import FooterAppLink from "./FooterAppLink";

// グローバルフッタ（2026-06-22 CEO 合意・B3）。
//
// これまで Web には共通ヘッダ/フッタが無く、検索流入が着地する全ページ
// （ルート/エリア/スポット）に「誰が運営しているか」のサイト共通シグナルが皆無だった。
// フッタ 1 枚で全ページに運営者（実在の DogHub）と会社情報・規約・DMO サポートを常設し、
// Authority（組織の実在性・透明性）を底上げする。
//
// 誠実性ルール: 「実走」「踏破」「現地確認」とは書かない。事実（運営者・編集・継続更新）のみ。

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--color-ww-text-secondary)",
  lineHeight: 2,
};

const headingStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-ww-text-tertiary)",
  marginBottom: 8,
};

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-ww-border-subtle)",
        backgroundColor: "var(--color-ww-bg-secondary)",
        marginTop: 64,
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: 1200, padding: "48px 16px 32px" }}
      >
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ gap: 32 }}
        >
          {/* ブランド + 運営 */}
          <div className="col-span-2">
            <p
              className="ww-serif"
              style={{
                fontFamily: "var(--font-ww-serif)",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--color-ww-text)",
                letterSpacing: "0.02em",
              }}
            >
              WanWalk
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-ww-text-secondary)",
                lineHeight: 1.8,
                marginTop: 8,
                maxWidth: 360,
              }}
            >
              犬連れに特化した散歩ルート体験メディア。実在の犬同伴施設が運営・編集し、犬連れ目線で情報を整備・更新しています。
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-ww-text-secondary)",
                lineHeight: 1.8,
                marginTop: 16,
              }}
            >
              運営・編集：DogHub箱根仙石原
              <br />
              <a
                href="https://dog-hub.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
                style={{ color: "var(--color-ww-accent)", fontWeight: 500 }}
              >
                犬のホテル&カフェ DogHub箱根仙石原
                <ArrowUpRight size={13} weight="regular" />
              </a>
            </p>
          </div>

          {/* サイト内ナビ */}
          <nav aria-label="サイト">
            <p style={headingStyle}>さがす</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li><Link href="/routes" style={linkStyle}>ルート一覧</Link></li>
              <li><Link href="/areas" style={linkStyle}>エリアから探す</Link></li>
              <li><Link href="/spots" style={linkStyle}>犬連れスポット</Link></li>
            </ul>
          </nav>

          {/* 運営・規約 */}
          <nav aria-label="WanWalkについて">
            <p style={headingStyle}>WanWalk</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li><Link href="/about" style={linkStyle}>WanWalkについて</Link></li>
              <li><Link href="/news" style={linkStyle}>お知らせ</Link></li>
              <li><Link href="/terms" style={linkStyle}>利用規約</Link></li>
              <li><Link href="/privacy" style={linkStyle}>プライバシーポリシー</Link></li>
              <li><FooterAppLink /></li>
            </ul>
          </nav>
        </div>

        {/* DMO + copyright */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid var(--color-ww-border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--color-ww-text-tertiary)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Supported by 箱根DMO
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--color-ww-text-tertiary)",
            }}
          >
            © {year} DogHub Inc.
          </span>
        </div>
      </div>
    </footer>
  );
}
