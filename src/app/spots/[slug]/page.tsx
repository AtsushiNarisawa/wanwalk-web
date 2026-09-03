import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Coffee,
  ForkKnife,
  Tree,
  Dog,
  Drop,
  Toilet,
  Car,
  Binoculars,
  Storefront,
  MapPin,
  Path,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { getAllSpotSlugs, getSpotBySlug, getAreaSpotLinks } from "@/lib/walks/data";
import { formatSpotDistance, formatDistance } from "@/lib/walks/format";
import {
  buildSpotMetaDescription,
  buildRoutePositionText,
  sanitizeText,
  sanitizeList,
  sanitizeParking,
} from "@/lib/walks/spot-page-content";
import { NON_SEO_SPOT_CATEGORIES } from "@/types/walks";
import { LOW_DEMAND_NOINDEX_SPOT_SLUGS } from "@/lib/noindex-spot-slugs";
import type { SpotCategory } from "@/types/walks";
import SupportedBadge from "@/components/walks/SupportedBadge";
import GoogleMapEmbed from "@/components/walks/GoogleMapEmbed";
import ShareMenu from "@/components/walks/ShareMenu";
import TrustByline from "@/components/walks/TrustByline";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import WalkInAppCTA from "@/components/walks/WalkInAppCTA";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import {
  ORG_REF,
  webPageSchema,
  breadcrumbSchema,
} from "@/lib/walks/structured-data";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

const CATEGORY_CONFIG: Record<SpotCategory, { icon: Icon; label: string }> = {
  cafe: { icon: Coffee, label: "カフェ" },
  restaurant: { icon: ForkKnife, label: "レストラン" },
  park: { icon: Tree, label: "公園・自然" },
  dog_run: { icon: Dog, label: "ドッグラン" },
  water_station: { icon: Drop, label: "水飲み場" },
  restroom: { icon: Toilet, label: "トイレ" },
  parking: { icon: Car, label: "駐車場" },
  viewpoint: { icon: Binoculars, label: "景観ポイント" },
  shop: { icon: Storefront, label: "ショップ" },
  landmark: { icon: MapPin, label: "ランドマーク" },
};

// 犬の同伴条件（受入サイズ・同伴できる場所・リード/キャリーの要否・ペット料金・
// ワクチン要件）は、このページのどこにも出さない（2026-08-02 CEO 確定）。
// 施設ごとにばらつきがあり、しかも変わるため。本文・FAQ（JSON-LD）・meta の3箇所すべてから外した。
// DB の dog_policy と型は温存＝表示だけ止める可逆な対応。
// 撤去したもの: SIZE_LABELS（全犬種OK / 中型犬以下 / 小型犬のみ）、「犬連れ情報」の
// 対象犬種・店内・テラス席・リード・キャリー・犬料金・notes、FAQ の「大型犬も利用できますか？」
// 「テラス席はありますか？」と Q1 内の条件列挙。
//
// 2026-08-03 追加: 「犬連れ情報」欄を丸ごと撤去し、「公式サイト/現地でご確認ください」型の
// 誘導文・確認喚起も全廃した（本文・FAQ両方）。散歩側（route_spots）には誘導先が実質存在しない
// （website_url 充足率 1/602・phone 0/602）ため、誘導文自体が実体の無い案内だった。
// 施設紹介である箱根 dog-map（directory_places）は誘導先が 46/46 実在するため対象外・据え置き。
//
// 営業時間・価格帯も同じ理由で非表示（2026-07-28 CEO 決定。箱根 dog-map では同日撤去済みだったが、
// このページに適用漏れが残っていたのを 2026-08-03 に回収）。「基本情報」の営業時間・価格帯の行と、
// JSON-LD の openingHours を外した。DB のカラム・SELECT（getSpotBySlug は SELECT *）・
// 型定義（RouteSpot.opening_hours / price_range）は温存＝表示だけ止める可逆な対応。

export async function generateStaticParams() {
  try {
    const slugs = await getAllSpotSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);
  if (!spot) return {};

  const cat = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]?.label
    : "";
  // meta description（2026-09-03 刷新）。
  // 旧: `${エリア}の${カテゴリ}「${名前}」。${犬連れOK}${description.slice(0,80)}`。
  // description は /routes/{slug} の旅程と一字一句同じなので meta まで重複していたうえ、
  // 素の slice で 80 字目に文が切れていた。固有素材（見どころ・過ごし方・親ルート・
  // 駐車場の有無）を文単位で組み立てる方式に置き換える。料金語・同伴条件のガードは
  // spot-page-content.ts 側で一元的にかける。
  const desc = buildSpotMetaDescription({
    name: spot.name,
    areaName: spot.area_name,
    categoryLabel: cat || null,
    petFriendly: spot.pet_friendly,
    spotPageBody: spot.spot_page_body,
    bodyText: spot.description,
    landscapeFeature: spot.landscape_feature,
    activitySuggestions: spot.activity_suggestions,
    routeName: spot.route_name,
    hasParking: Boolean(sanitizeParking(spot.route_parking, spot.route_slug)),
  });

  const catLabel = cat ? `（${cat}）` : "";
  const dogBadge = spot.pet_friendly ? "犬OK " : "";
  // CTR 改善（2026-06 GSC 高表示・低CTR・犬意図クエリ対策 ＋ 7月中旬 箱根DMO被リンクの受け皿）:
  // 「{名所} 犬連れ」型の検索意図に対し、犬連れ可否の答えを先頭に出したタイトルを slug 単位で上書き。
  // h1・パンくず・構造化データは spot.name のままなので表示崩れなし。検索語は「犬連れ」に統一（CEO 合意・routes と同方針）。
  // 内容は監査済み spot.description / route meta_description にトレース可能（誠実性: 境内不可は明記し隠さない）。
  const SPOT_TITLE_OVERRIDES: Record<string, string> = {
    "hasedera-monzen": "長谷寺 犬連れ｜境内はペット不可・門前と見晴台の鎌倉さんぽ",
    "yokohama-hamma-heddo": "横浜ハンマーヘッド 犬連れ｜犬専用水飲み場のある複合施設",
    "hakone-jinja-keidai": "箱根神社 犬連れ｜杉並木の参道を歩く芦ノ湖さんぽ",
    "kotokuin-kamakura-daibutsu": "鎌倉大仏（高徳院）犬連れ｜境内はペット不可・大仏ハイキングの道",
  };
  const title =
    SPOT_TITLE_OVERRIDES[slug] ??
    `${dogBadge}${spot.name}${catLabel}｜${spot.area_name}の犬連れスポット`;
  const ogImage = `https://wanwalk.jp/api/og/spots/${slug}`;
  // 需要が確認できなかったスポットページは noindex にする（2026-09-03）。
  // ページも内部リンクも残すので follow: true。対象 slug と判断根拠・戻し方は
  // src/lib/noindex-spot-slugs.ts に台帳としてまとめてある。
  // 書き方は routes/[slug] の SUBMISSION_NOINDEX_SLUGS と同じ形に揃えている。
  const robots = LOW_DEMAND_NOINDEX_SPOT_SLUGS.has(slug)
    ? { index: false, follow: true }
    : undefined;
  return {
    title,
    description: desc,
    ...(robots ? { robots } : {}),
    alternates: { canonical: `/spots/${slug}` },
    ...buildOgMetadata({
      title,
      description: desc,
      path: `/spots/${slug}`,
      ogImage,
      ogImageAlt: `${spot.name} - ${spot.area_name}`,
    }),
  };
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);
  if (!spot) notFound();

  // インフラ系（駐車場・トイレ・水飲み場）は SEO ランディング対象外。
  // ルート上の地図マーカー・コースガイドとしては表示するが、独立ページは生成しない。
  if (spot.category && NON_SEO_SPOT_CATEGORIES.has(spot.category as SpotCategory)) {
    notFound();
  }

  const catConfig = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]
    : null;
  const CatIcon = catConfig?.icon;
  // updated_at / created_at は SELECT * で取得済みだが型に無いため runtime で参照。
  const spotDates = spot as unknown as { updated_at?: string; created_at?: string };

  // FAQ items for structured data
  // ⚠️ 個別の同伴条件・確認喚起（「公式サイト/現地でご確認ください」等）は答えに含めない
  //    （2026-08-02 CEO 確定・2026-08-03 誘導文も対象と確定）。JSON-LD は本文と同じ扱いで、
  //    条件や誘導文を書くと検索結果・AI 回答に転載される。散歩側（route_spots）には誘導先の
  //    公式URLが実質存在しない（website_url 充足率 1/602）ため、誘導文自体が不誠実だった。
  // 地図（2026-09-03）。スポットページはルート詳細の旅程テキストと本文が同一で、
  // 写真も地図も無く差別化要素が無かった（CEO 指摘）。座標は全スポットが DB に持つため、
  // 追加コストゼロで固有の情報を出せる唯一の要素として地図を置く。
  // 方式はルート詳細と同じ GoogleMapEmbed（output=embed の公開埋め込み・APIキー不要・課金ゼロ）。
  // parseRouteLocation と同様、解釈できなかったときの 0,0（null island）は明示的に除外する。
  const hasGeo =
    typeof spot.lat === "number" &&
    typeof spot.lng === "number" &&
    Number.isFinite(spot.lat) &&
    Number.isFinite(spot.lng) &&
    spot.lat !== 0 &&
    spot.lng !== 0;

  // 本文（2026-09-03）。spot_page_body があればそれ、無ければ description。
  // description は /routes/{slug} の旅程と一字一句同じなので、編集部が spot_page_body を
  // 入れたスポットからこのページ固有の本文に差し替わる。/routes 側（RouteItinerary）は
  // 従来どおり description のまま＝旅程の文言は一切変えない。
  const bodyText = spot.spot_page_body ?? spot.description;

  // 「愛犬と歩く」（2026-09-03）。landscape_feature / activity_suggestions は DB にありながら
  // Web のどこにも描画されていなかった列。ここで初めて画面に出るため、料金語ガードを通す
  // （実データに「広大な無料ドッグラン」があり、素通しにすると料金語が新たに露出する）。
  // 両方とも空ならセクションごと出さない＝空枠を作らない。
  const landscapeFeature = sanitizeText(spot.landscape_feature);
  const activitySuggestions = sanitizeList(spot.activity_suggestions);
  const hasWalkSection = Boolean(landscapeFeature) || activitySuggestions.length > 0;

  // 「行き方」（2026-09-03）。親ルートの pet_info->>'parking'（公開100本すべて充填済み）。
  // 料金語を含むのは実測でポーラ美術館の1本だけで、そこは CEO の明示的な例外として通す。
  const parking = sanitizeParking(spot.route_parking, spot.route_slug);

  // ルート内の位置（2026-09-03）。distance_from_start は全 416 件充填済み。
  const routePosition = buildRoutePositionText({
    distanceFromStart: spot.distance_from_start,
    routeDistanceMeters: spot.route_distance_meters,
    estimatedMinutes: spot.route_estimated_minutes,
    formatSpotDistance,
    formatDistance,
  });

  // 同じエリアの他スポット（2026-09-03）。従来このページからの内部リンクは親ルート1本だけで、
  // 横の回遊がゼロだった。noindex 台帳の slug はリンク先から外す（評価を流す先にしない）。
  const areaSpotLinks = (await getAreaSpotLinks(spot.area_slug, slug))
    .filter((s) => !LOW_DEMAND_NOINDEX_SPOT_SLUGS.has(s.slug))
    .slice(0, 6);

  const faqItems: { q: string; a: string }[] = [];
  if (spot.pet_friendly) {
    faqItems.push({
      q: `${spot.name}は犬連れで入れますか？`,
      a: `はい、${spot.name}は愛犬と一緒に利用できます。`,
    });
  }

  return (
    <>
      <article
        className="mx-auto"
        style={{ maxWidth: 896, padding: "32px 16px" }}
      >
        {/* パンくず */}
        <nav
          style={{
            fontSize: 13,
            color: "var(--color-ww-text-tertiary)",
            marginBottom: 24,
          }}
        >
          <Link href="/" style={{ color: "inherit" }}>
            トップ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/spots" style={{ color: "inherit" }}>
            スポット一覧
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link
            href={`/areas/${spot.area_slug}`}
            style={{ color: "inherit" }}
          >
            {spot.area_name}
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--color-ww-text-secondary)" }}>
            {spot.name}
          </span>
        </nav>

        {/* 写真 */}
        {spot.photo_url && (
          <div
            className="relative overflow-hidden mb-8"
            style={{
              aspectRatio: "16 / 9",
              borderRadius: "var(--radius-ww-sm)",
              backgroundColor: "var(--color-ww-bg-secondary)",
            }}
          >
            <Image
              src={spot.photo_url}
              alt={spot.name}
              fill
              className="object-cover"
              style={{ objectPosition: spot.photo_metadata?.image_position ?? "center" }}
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* カテゴリバッジ + タイトル */}
        <header style={{ marginBottom: 32 }}>
          {catConfig && CatIcon && (
            <div
              className="inline-flex items-center gap-2 mb-4"
              style={{
                fontSize: 13,
                color: "var(--color-ww-accent)",
                backgroundColor: "var(--color-ww-accent-soft)",
                padding: "6px 14px",
                borderRadius: "var(--radius-ww-sm)",
                fontWeight: 500,
              }}
            >
              <CatIcon size={16} weight="regular" />
              {catConfig.label}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-ww-serif)",
                fontSize: 32,
                fontWeight: 700,
                color: "var(--color-ww-text)",
                letterSpacing: "0.01em",
                lineHeight: 1.35,
                margin: 0,
                flex: 1,
              }}
            >
              {spot.name}
            </h1>
            <ShareMenu
              url={`https://wanwalk.jp/spots/${slug}`}
              text={`${spot.name} - ${spot.area_name}の犬連れスポット`}
              title={`${spot.name} | WanWalk`}
              size="sm"
            />
          </div>

          <div
            className="flex items-center gap-3 flex-wrap"
            style={{ fontSize: 14, color: "var(--color-ww-text-secondary)" }}
          >
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} weight="regular" />
              <Link
                href={`/areas/${spot.area_slug}`}
                style={{ color: "inherit" }}
              >
                {spot.area_name}
              </Link>
            </span>
            {spot.pet_friendly && (
              <span
                className="inline-flex items-center gap-1"
                style={{
                  color: "var(--color-ww-accent)",
                  fontWeight: 500,
                }}
              >
                <CheckCircle size={14} weight="fill" />
                犬連れOK
              </span>
            )}
          </div>
        </header>

        <WalkInAppCTA
          sourcePage="spot_detail"
          placement="spot_detail_walk"
          title="アプリで愛犬との散歩を記録する"
          subcopy="GPSで現在地を確認しながら、歩いた距離や時間を残せます。"
        />

        <div style={{ margin: "24px 0" }}>
          <TrustByline
            updatedAt={spotDates.updated_at}
            scopeNote="掲載内容は公開情報をもとに整備し、随時見直しています。"
          />
        </div>

        {/* 説明文（spot_page_body があればそちら・無ければ description） */}
        {bodyText && (
          <section style={{ marginBottom: 32 }}>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "var(--color-ww-text)",
              }}
            >
              {bodyText}
            </p>
          </section>
        )}

        {/* 愛犬と歩く。landscape_feature も activity_suggestions も無いスポットでは
            セクションごと出さない（見出しだけの空枠を作らない）。 */}
        {hasWalkSection && (
          <section style={{ marginBottom: 32 }}>
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
              愛犬と歩く
            </h2>
            {landscapeFeature && (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "var(--color-ww-text)",
                  marginBottom: activitySuggestions.length > 0 ? 16 : 0,
                }}
              >
                {landscapeFeature}
              </p>
            )}
            {activitySuggestions.length > 0 && (
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {activitySuggestions.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-2"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: "var(--color-ww-text)",
                    }}
                  >
                    <Dog
                      size={16}
                      weight="regular"
                      style={{
                        color: "var(--color-ww-accent)",
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* 地図。座標が取れないスポットではセクションごと出さない（空枠を作らない） */}
        {hasGeo && (
          <section style={{ marginBottom: 32 }}>
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
              {spot.name}の場所
            </h2>
            <GoogleMapEmbed
              query={`${spot.lat},${spot.lng}`}
              title={`${spot.name}の場所（Googleマップ）`}
              zoom={15}
              height={280}
            />
          </section>
        )}

        {/* 行き方。親ルートの駐車場（official_routes.pet_info->>'parking'）。
            値が無い、または料金語ガードで落ちたときはセクションごと出さない。
            料金は「無料」「有料」の別も含めて書かない（2026-09-02 CEO 決定）。
            例外はポーラ美術館の駐車場のみで、そこは既存文言のまま通す。 */}
        {parking && (
          <section style={{ marginBottom: 32 }}>
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
              行き方
            </h2>
            <div
              className="flex items-start gap-2"
              style={{ fontSize: 14, lineHeight: 1.75 }}
            >
              <Car
                size={16}
                weight="regular"
                style={{
                  color: "var(--color-ww-accent)",
                  flexShrink: 0,
                  marginTop: 5,
                }}
              />
              <span style={{ color: "var(--color-ww-text)" }}>
                駐車場：{parking}
              </span>
            </div>
          </section>
        )}

        {/* 犬連れ情報セクションは撤去（2026-08-03 CEO 確定）。
            従来この欄は DB の dog_policy を一切描画せず、`dog_policy が非 null` を表示条件にした
            固定の「公式サイト/現地でご確認ください」文言を出すだけだった。散歩側（route_spots）には
            誘導先の公式URLが実質存在しない（website_url 充足率 1/602）ため、ブロックごと削除した。
            DB の dog_policy カラム・型（DogPolicy）・SELECT（getSpotBySlug は SELECT *）は温存＝
            表示だけ止める可逆な対応。 */}

        {/* 基本情報。
            営業時間・価格帯は非表示（2026-07-28 CEO 決定）。残るのは電話と公式サイトのみなので、
            どちらも無いスポットでは見出しだけが残らないようセクションごと出さない。 */}
        {(spot.phone || spot.website_url) && (
          <section style={{ marginBottom: 32 }}>
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
              基本情報
            </h2>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              style={{ fontSize: 14 }}
            >
              {spot.phone && <InfoRow label="電話" value={spot.phone} />}
              {spot.website_url && (
                <div className="flex items-start gap-2">
                  <span
                    style={{
                      color: "var(--color-ww-text-secondary)",
                      minWidth: 80,
                    }}
                  >
                    公式サイト
                  </span>
                  <a
                    href={spot.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--color-ww-accent)" }}
                  >
                    公式サイトを見る
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* このスポットを通るルート */}
        <section style={{ marginBottom: 32 }}>
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
            このスポットを通るルート
          </h2>
          <Link
            href={`/routes/${spot.route_slug}`}
            className="group flex items-center justify-between transition-colors"
            style={{
              padding: "16px 20px",
              backgroundColor: "var(--color-ww-bg-secondary)",
              border: "1px solid var(--color-ww-border-subtle)",
              borderRadius: "var(--radius-ww-md)",
            }}
          >
            <div className="flex items-center gap-3">
              <Path
                size={20}
                weight="regular"
                style={{ color: "var(--color-ww-accent)" }}
              />
              <div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-ww-text)",
                  }}
                >
                  {spot.route_name}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-ww-text-secondary)",
                  }}
                >
                  {spot.area_name}
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              weight="regular"
              style={{ color: "var(--color-ww-text-tertiary)" }}
            />
          </Link>
          {/* ルート内の位置（2026-09-03）。distance_from_start とルートの総距離・所要時間から
              「起点から◯◯地点」を出す。距離表記は DESIGN_TOKENS §9（区間は m/km 切替・
              総距離は常に km）。distance_from_start が無いスポットでは行ごと出さない。 */}
          {routePosition && (
            <p
              className="numeric"
              style={{
                marginTop: 12,
                fontSize: 13,
                lineHeight: 1.75,
                color: "var(--color-ww-text-secondary)",
              }}
            >
              {routePosition}
            </p>
          )}
        </section>

        {/* 同じエリアの他のスポット。0件ならセクションごと出さない。 */}
        {areaSpotLinks.length > 0 && (
          <section style={{ marginBottom: 32 }}>
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
              {spot.area_name}の他のスポット
            </h2>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              style={{ listStyle: "none", padding: 0, margin: 0 }}
            >
              {areaSpotLinks.map((s) => {
                const c = s.category ? CATEGORY_CONFIG[s.category] : null;
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/spots/${s.slug}`}
                      className="flex items-center justify-between gap-3 transition-colors"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid var(--color-ww-border-subtle)",
                        borderRadius: "var(--radius-ww-md)",
                        color: "var(--color-ww-text)",
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {s.name}
                      </span>
                      {c && (
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--color-ww-text-secondary)",
                            flexShrink: 0,
                          }}
                        >
                          {c.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Tips */}
        {spot.tips && (
          <section
            style={{
              marginBottom: 32,
              padding: 20,
              backgroundColor: "var(--color-ww-bg-secondary)",
              borderRadius: "var(--radius-ww-md)",
              border: "1px solid var(--color-ww-border-subtle)",
            }}
          >
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                color: "var(--color-ww-text-secondary)",
              }}
            >
              {spot.tips}
            </p>
          </section>
        )}

        <div className="py-8">
          <WalksAppCTA sourcePage="spot_detail" />
        </div>

        <SupportedBadge />
      </article>

      {/* JSON-LD: LocalBusiness / TouristAttraction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type":
              spot.category === "cafe" || spot.category === "restaurant"
                ? "Restaurant"
                : spot.category === "shop"
                  ? "Store"
                  : "TouristAttraction",
            name: spot.name,
            // 本文と同じフォールバック（spot_page_body ?? description）。
            description: bodyText ?? undefined,
            author: ORG_REF,
            publisher: ORG_REF,
            // geo は本文の地図と同じ hasGeo で判定する（0,0 の null island を出さない）。
            // 2026-09-03 まで parseSpotLocation が EWKB を読めず lat/lng が全件 null
            // だったため、この geo は一度も出力されていなかった。
            ...(hasGeo
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: spot.lat,
                    longitude: spot.lng,
                  },
                }
              : {}),
            ...(spot.photo_url ? { image: spot.photo_url } : {}),
            // openingHours / priceRange は出さない（2026-07-28 CEO 決定）。
            // JSON-LD は本文と同じ扱いで、書くと検索結果・AI 回答に転載される。
            ...(spot.phone ? { telephone: spot.phone } : {}),
            ...(spot.website_url ? { url: spot.website_url } : {}),
            ...(spot.pet_friendly
              ? { additionalProperty: { "@type": "PropertyValue", name: "犬連れ", value: "可" } }
              : {}),
          }),
        }}
      />

      {/* FAQ structured data */}
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a,
                },
              })),
            }),
          }}
        />
      )}

      {/* WebPage（発行者 author/publisher + 公開日/更新日） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageSchema({
              path: `/spots/${slug}`,
              name: spot.name,
              description: bodyText,
              datePublished: spotDates.created_at,
              dateModified: spotDates.updated_at,
              primaryImage: spot.photo_url,
            })
          ),
        }}
      />

      {/* パンくず構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "トップ", path: "/" },
              { name: "スポット一覧", path: "/spots" },
              { name: spot.area_name, path: `/areas/${spot.area_slug}` },
              { name: spot.name, path: `/spots/${slug}` },
            ])
          ),
        }}
      />
    </>
  );
}

function InfoRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        style={{
          color: "var(--color-ww-text-secondary)",
          minWidth: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center gap-1"
        style={{ color: "var(--color-ww-text)", fontWeight: 500 }}
      >
        {ok !== undefined &&
          (ok ? (
            <CheckCircle
              size={14}
              weight="fill"
              style={{ color: "var(--color-ww-success)" }}
            />
          ) : (
            <XCircle
              size={14}
              weight="fill"
              style={{ color: "var(--color-ww-text-tertiary)" }}
            />
          ))}
        {value}
      </span>
    </div>
  );
}
