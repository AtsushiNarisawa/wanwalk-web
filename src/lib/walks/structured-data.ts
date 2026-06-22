// E-E-A-T 信頼シグナルの構造化データ共通ヘルパー。
//
// 目的（Tier A / 2026-06-22 CEO 合意）:
// - author / publisher を実在の発行者 Organization「WanWalk（親=DogHub株式会社）」に統一し、
//   全ページから同一 @id を参照して「同一の発行者による複数コンテンツ」という権威を集約する。
// - datePublished / dateModified（= created_at / updated_at）で Freshness の機械シグナルを与える。
// - BreadcrumbList でサイト構造を機械可読化する。
//
// 重要（誠実性ルール）: WanWalk の公式ルートは「物理的な踏破・現地確認」をしていない。
// よって本ファイルが生成するのは「発行者・更新日・サイト構造」という事実のみで、
// 「実走」「現地確認」等の未検証の主張は一切含めない。

export const SITE_URL = "https://wanwalk.jp";
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** author / publisher から参照する Organization の @id 参照。実体は layout.tsx が全ページに出力する。 */
export const ORG_REF = { "@id": ORG_ID } as const;

/**
 * 発行者 Organization（実体ノード）。layout.tsx で全ページに 1 度だけ出力し、
 * 各ページの author/publisher は ORG_REF（@id 参照）でこれを指す。
 */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "WanWalk",
    alternateName: "ワンウォーク",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description:
      "犬連れに特化した散歩ルート体験メディア。実在の犬同伴施設 DogHub が運営・編集し、犬連れ目線で散歩ルートと犬連れスポットを整備・更新している。",
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
    areaServed: { "@type": "Country", name: "Japan" },
    parentOrganization: {
      "@type": "Organization",
      "@id": "https://dog-hub.shop/#organization",
      name: "DogHub株式会社",
      alternateName: "DogHub箱根仙石原",
      url: "https://dog-hub.shop",
      description:
        "箱根仙石原で犬のホテル&カフェ「DogHub」を運営。愛犬家のお客様の声をもとに WanWalk を開発・運営。",
    },
    sameAs: ["https://dog-hub.shop"],
  };
}

/** WebSite ノード。発行者を Organization @id で結ぶ。layout.tsx で全ページに出力。 */
export function webSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "WanWalk",
    inLanguage: "ja",
    publisher: ORG_REF,
  };
}

/** layout.tsx 用: Organization + WebSite をまとめた @graph。 */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), webSiteSchema()],
  };
}

type WebPageInput = {
  path: string; // 例: "/routes/foo"（先頭スラッシュ）
  name: string;
  description?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  primaryImage?: string | null;
};

/**
 * ページ単位の WebPage ノード。datePublished / dateModified / author / publisher を載せる
 * （Google が Freshness と発行者を読む正規の置き場所）。
 */
export function webPageSchema(input: WebPageInput) {
  const url = `${SITE_URL}${input.path}`;
  const datePublished = input.datePublished ? toIso(input.datePublished) : undefined;
  const dateModified = input.dateModified ? toIso(input.dateModified) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    inLanguage: "ja",
    isPartOf: { "@id": WEBSITE_ID },
    ...(input.primaryImage ? { primaryImageOfPage: input.primaryImage } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: ORG_REF,
    publisher: ORG_REF,
  };
}

/** HTML パンくずに対応する BreadcrumbList。items は表示順（トップ→…→現在ページ）。 */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path.startsWith("http") ? it.path : `${SITE_URL}${it.path}`,
    })),
  };
}

/**
 * Supabase の timestamptz（例 "2026-06-22 02:05:01.4+00"）を ISO 8601 へ。
 * パース失敗時は元文字列を返す（安全側）。
 */
export function toIso(ts: string): string {
  const d = new Date(ts.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? ts : d.toISOString();
}

/**
 * 「2026年6月」形式（JST）の表示用フォーマット。最終更新の可視化に使う。
 * updated_at は「行が更新された事実」を表すため、ここでは「最終更新」とだけ表現し、
 * 「現地確認」等の強い主張には使わない。
 */
export function formatUpdatedYearMonth(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${jst.getUTCFullYear()}年${jst.getUTCMonth() + 1}月`;
}
