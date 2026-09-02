import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllPublishedRoutes,
  getRouteBySlug,
  getRouteSpots,
  getRouteLineCoordinates,
  getRouteAreaInfo,
  toItinerarySpot,
  toMapSpot,
} from "@/lib/walks/data";
import SupportedBadge from "@/components/walks/SupportedBadge";
import RouteFeedback from "@/components/walks/RouteFeedback";
import RouteMapWrapper from "@/components/walks/RouteMapWrapper";
import GoogleMapEmbed from "@/components/walks/GoogleMapEmbed";
import SpecBar from "@/components/walks/SpecBar";
import PetInfoGrid, { hasPetInfoContent } from "@/components/walks/PetInfoGrid";
import RouteActions from "@/components/walks/RouteActions";
import RouteItinerary from "@/components/walks/RouteItinerary";
import SeasonHighlight from "@/components/walks/SeasonHighlight";
import RelatedRoutes from "@/components/walks/RelatedRoutes";
import AreaRouteLinks from "@/components/walks/AreaRouteLinks";
import HakoneDogMapLink from "@/components/walks/HakoneDogMapLink";
import TrustByline from "@/components/walks/TrustByline";
import SubmissionCredit from "@/components/walks/SubmissionCredit";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import WalkInAppCTA from "@/components/walks/WalkInAppCTA";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import { formatDistance } from "@/lib/walks/format";
import { isHakoneAreaSlug } from "@/lib/walks/area-taxonomy";
import RouteParking from "@/components/walks/RouteParking";
import { buildParkingInfo, stripTrailingPeriod } from "@/lib/walks/parking";
import {
  ORG_REF,
  webPageSchema,
  breadcrumbSchema,
} from "@/lib/walks/structured-data";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

type FaqEntry = { "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } };

function buildRouteFaq(
  route: import("@/types/walks").RouteWithArea,
  spots: import("@/types/walks").RouteSpot[],
  distanceLabel: string,
  isArea: boolean
): FaqEntry[] {
  const petInfo = route.pet_info;
  const requiredSpots = spots.filter((s) => !s.is_optional);
  // インフラ系（駐車場・トイレ・給水・ランドマーク）は pet_friendly=false でも実害なし（教訓 B-Z+β）→ NG列挙から除外
  const INFRA_CATEGORIES = new Set(["parking", "restroom", "water_station", "landmark"]);
  const visitableSpots = requiredSpots.filter((s) => !INFRA_CATEGORIES.has(s.category ?? ""));
  const okCount = visitableSpots.filter((s) => s.pet_friendly === true).length;
  const ngSpots = visitableSpots.filter((s) => s.pet_friendly === false);
  const ngNames = ngSpots.slice(0, 2).map((s) => s.name);

  // Q1: 犬連れ可否（pet_friendly比率で動的）
  const sizeLabel = isArea
    ? `滞在目安は約${route.estimated_minutes}分の園内散策コース`
    : `距離${distanceLabel}・所要約${route.estimated_minutes}分のコース`;
  let q1Answer: string;
  if (visitableSpots.length === 0) {
    q1Answer = `はい、${route.name}は犬連れで散歩できる${isArea ? "施設" : "ルート"}です。${sizeLabel}です。リード着用でお楽しみください。`;
  } else if (ngSpots.length === 0) {
    q1Answer = `はい、${route.name}は犬連れで楽しめます。${sizeLabel}で、コース上の見どころスポット${visitableSpots.length}箇所すべてが犬連れOKです。リード着用でお楽しみください。`;
  } else if (ngSpots.length < visitableSpots.length / 2) {
    q1Answer = `はい、${route.name}の散歩自体は犬連れOKです。${sizeLabel}で、${okCount}箇所のスポットを愛犬と楽しめます。ただし${ngNames.join("・")}は内部・境内が犬同伴不可のため、外観・門前からの拝観でお楽しみください。`;
  } else {
    q1Answer = `${route.name}のコース散歩自体は犬連れで歩けます（${sizeLabel}）。ただし${ngNames.join("・")}など内部・境内が犬同伴不可のスポットがあります。門前・参道・外観からの散策をお楽しみください。`;
  }

  // Q2: 駐車場（2026-09-02 改修）。
  // ・質問文は route.name（詩的なコース名）ではなく地名を使う＝「〇〇 駐車場」の検索語に噛み合わせる
  // ・回答は「どこにあるか（pet_info.parking）＋コースのどちら側か・そこから歩き出せるか」
  // ・末尾句点は endWithPeriod で正規化（旧実装は「…（70台）。。」と句点が重なっていた）
  const parking = buildParkingInfo(route, spots);
  const q2Answer =
    [parking.parkingText, parking.structureText].filter(Boolean).join("") ||
    "公式の駐車場情報は登録されていません。お出かけ前に最寄りの駐車場をご確認ください。";

  // Q3: ベストシーズン（DB値をそのまま使用・CEO監修済）
  // DB値に末尾「。」を持つものがあり（2件）、そのままだと「…快適。です。」になるため句点を落として連結する。
  const q3Answer = petInfo?.best_season
    ? `${route.name}のベストシーズンは、${stripTrailingPeriod(petInfo.best_season)}です。`
    : `${route.name}は通年で犬連れ散歩を楽しめます。`;

  // Q4: カート走行可否（cart_notes 冒頭の結論語と前置きの重複を避ける + 末尾に句点を補う）
  const cartNotes = route.cart_notes?.trim() ?? "";
  const cleanedCartNotes = cartNotes.replace(/^カート(非推奨|推奨)。?\s*/, "").trim();
  const ensurePunct = (s: string) => (s && !/[。．\.!?！？、]$/.test(s) ? `${s}。` : s);
  const cartTail = ensurePunct(cartNotes) || "舗装メインで走行可能です。";
  const cleanedCartTail = ensurePunct(cleanedCartNotes) || "段差や未舗装区間が多いため、";
  const q4Answer = route.cart_friendly
    ? `はい、${route.name}はベビーカーやペットカートで散歩できます。${cartTail}`
    : `${route.name}はベビーカー・ペットカートでの散歩には向きません。${cleanedCartTail}抱っこ移動やキャリーバッグをご検討ください。`;

  // Q5: 犬連れOKカフェ・レストラン（0件なら省略）
  const dogOkCafes = spots.filter(
    (s) => (s.category === "cafe" || s.category === "restaurant") && s.pet_friendly === true
  );
  const faqs: FaqEntry[] = [
    { "@type": "Question", name: `${route.name}は犬連れで散歩できますか？`, acceptedAnswer: { "@type": "Answer", text: q1Answer } },
    // ⚠️ 駐車場の質問文だけ地名（parking.placeName）を使う。他のQは犬連れクエリで好調なため route.name のまま。
    { "@type": "Question", name: `${parking.placeName}に駐車場はありますか？`, acceptedAnswer: { "@type": "Answer", text: q2Answer } },
    { "@type": "Question", name: `${route.name}のベストシーズンはいつですか？`, acceptedAnswer: { "@type": "Answer", text: q3Answer } },
    { "@type": "Question", name: `${route.name}はベビーカーやペットカートで歩けますか？`, acceptedAnswer: { "@type": "Answer", text: q4Answer } },
  ];

  if (dogOkCafes.length > 0) {
    // ⚠️ 席種（店内/テラス）は書かない（2026-08-02 CEO 確定）。dog_policy 由来の同伴条件は
    //    JSON-LD にも出さない。「各店舗に直接ご確認ください」等の確認喚起も対象
    //    （2026-08-03 追加確定・散歩側には誘導先の店舗URLが実質存在しないため）。
    const sample = dogOkCafes[0].name;
    const countText = dogOkCafes.length === 1 ? `1店` : `${dogOkCafes.length}店`;
    const q5Answer = `はい、${route.name}沿いには犬連れOKのカフェ・飲食スポットが${countText}あります（例: ${sample}）。`;
    faqs.push({
      "@type": "Question",
      name: `${route.name}沿いに犬連れで入れるカフェ・レストランはありますか？`,
      acceptedAnswer: { "@type": "Answer", text: q5Answer },
    });
  }

  return faqs;
}

export async function generateStaticParams() {
  try {
    const routes = await getAllPublishedRoutes();
    return routes.filter((r) => r.slug && typeof r.slug === "string").map((r) => ({ slug: r.slug }));
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
  const route = await getRouteBySlug(slug);
  if (!route) return {};

  const isArea = route.route_type === "area";
  const distanceLabel = formatDistance(route.distance_meters);
  const description =
    route.meta_description ??
    (isArea
      ? `${route.areas.name}の犬連れ散策コース「${route.name}」。園内散策、滞在目安${route.estimated_minutes}分。${route.description?.slice(0, 80) ?? ""}`
      : `${route.areas.name}の犬連れ散歩コース「${route.name}」。距離${distanceLabel}、所要${route.estimated_minutes}分。${route.description?.slice(0, 80) ?? ""}`);

  const sizeHint = isArea
    ? `${route.estimated_minutes}分散策`
    : `${distanceLabel}・${route.estimated_minutes}分`;
  // GSC 末尾切れ対策: route.name が「本体 説明」形式のルートで title が SERP の表示幅を超える場合、
  // 説明部分を省略する。slug ごとに明示指定（一律閾値だと「河口湖 もみじ回廊…」等が「河口湖」だけになり致命的）。
  const TITLE_SHORTEN_SLUGS = new Set<string>([]);
  // CTR 改善（2026-06 GSC 高表示・低CTRページ対策）: 検索語を先頭に置き、クリック誘因を明示した
  // タイトルを slug 単位で上書き。route.name（h1・パンくず・構造化データ）は変更しないため表示崩れなし。
  // 効果は 6月末 GSC ベンチマークで観測。
  const TITLE_OVERRIDES: Record<string, string> = {
    "nasu-minamigaoka-ranch": "南ヶ丘牧場 犬連れ散歩｜那須連山を望む高原牧場とガーンジィ牛",
    "miura-kurihama-hana": "くりはま花の国 犬連れ散歩｜春はポピー・秋はコスモス100万本",
    "yokohama-sankeien-honmoku-promenade": "三溪園 犬連れ散歩｜庭園の外周ループは犬OK 横浜本牧",
    "izu-shuzenji-onsen": "修善寺温泉 犬連れ散歩｜竹林の小径と渓流の橋めぐり",
    "tokyo-kasai-rinkai-park-loop": "葛西臨海公園 犬連れ散歩｜海・芝生・大観覧車を一周",
    "kawaguchiko-saiko-nenba": "西湖いやしの里根場 犬連れ散歩｜富士山と茅葺き集落",
    "odawara-castle-saigoji": "小田原城 犬連れ散歩｜城下町から御幸の浜の海岸へ",
    "kamakura-kita-engakuji-walk": "北鎌倉 犬連れ散歩｜円覚寺・あじさい寺明月院の門前めぐり",
    "karuizawa-taliesin-lakeside": "軽井沢タリアセン 犬連れ散歩｜塩沢湖畔とバラ園さんぽ",
    // 2026-06-22 追加（GSC 高表示・低CTR ＋ 7月中旬 箱根DMO被リンクの受け皿）。
    // 「愛犬」ではなく検索語「犬連れ」に統一（CEO 合意）。井の頭は現タイトル「井の頭池」と
    // 検索語「井の頭公園」のズレ修正も兼ねる。6/3 既存9本は計測のため非変更。
    "tokyo-inokashira-park-loop": "井の頭公園 犬連れ散歩｜池を一周30分・桜の名所と吉祥寺カフェ",
    "chichibu-hitsujiyama-shibazakura": "羊山公園 犬連れ散歩｜芝桜の丘と秩父の街並み(見頃4月中旬〜5月)",
    "hakone-sengokuhara-owakudani-ropeway": "大涌谷・桃源台 犬連れ散歩｜ロープウェイと芦ノ湖畔の絶景",
    "hakone-sengokuhara-pola-museum-trail": "ポーラ美術館 犬連れ散歩｜箱根の森の遊歩道さんぽ(館内は犬不可)",
  };
  const displayName = TITLE_SHORTEN_SLUGS.has(slug)
    ? route.name.split(" ")[0]
    : route.name;
  const title =
    TITLE_OVERRIDES[slug] ??
    `${displayName}｜${route.areas.name} 犬連れ散歩 ${sizeHint}`;
  const ogImage = `https://wanwalk.jp/api/og/${slug}`;
  // 決定18: 投稿ルート（origin='submission'）も index する。ただし GSC で品質問題の兆候が
  // 出た時点で slug 単位で noindex に倒せるよう、退避用の集合を用意しておく（現状は空＝全 index）。
  const SUBMISSION_NOINDEX_SLUGS = new Set<string>([]);
  const robots = SUBMISSION_NOINDEX_SLUGS.has(slug)
    ? { index: false, follow: true }
    : undefined;
  return {
    title,
    description,
    ...(robots ? { robots } : {}),
    alternates: { canonical: `/routes/${slug}` },
    // Smart App Banner の app-argument に正規 URL を渡す。インストール済み端末では
    // バナーの「開く」/ Universal Link 経由でアプリがこの URL を受け取り、該当ルート詳細へ遷移する。
    // app-id は layout.tsx・AppStoreBadge.tsx と同一値（SSoT）。
    itunes: { appId: "6757466888", appArgument: `https://wanwalk.jp/routes/${slug}` },
    ...buildOgMetadata({
      title,
      description,
      path: `/routes/${slug}`,
      ogImage,
      ogImageAlt: `${route.name} - ${route.areas.name}`,
    }),
  };
}

const difficultyLabels = { easy: "初級", moderate: "中級", hard: "上級" };
const levelDotColors = {
  easy: "var(--color-ww-level-easy)",
  moderate: "var(--color-ww-level-moderate)",
  hard: "var(--color-ww-level-hard)",
};

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const [spots, coordinates, areaInfo] = await Promise.all([
    getRouteSpots(route.id),
    getRouteLineCoordinates(route.id),
    getRouteAreaInfo(route.id),
  ]);

  // RSC ペイロード漏れ対策（2026-08-04）: RouteItinerary / RouteMapWrapper は
  // Client Component なので、渡した prop はハイドレーション用ペイロードにまるごと
  // シリアライズされる。dog_policy / opening_hours / price_range / phone /
  // website_url 等の非表示フィールドを渡さないよう、表示に使う列だけへ絞る
  // （lib/walks/data.ts の toItinerarySpot / toMapSpot）。
  // spots（フル取得）自体はこの下の FAQ 生成・JSON-LD の itinerary/amenityFeature で
  // 引き続き使うためそのまま保持する。
  const itinerarySpots = spots.map(toItinerarySpot);
  const mapSpots = spots.map(toMapSpot);

  const isArea = route.route_type === "area";
  const isSubmission = route.origin === "submission";
  const distanceLabel = formatDistance(route.distance_meters);
  const petInfo = route.pet_info;
  // 駐車場は専用セクションで答える（見出し＋本文）。FAQ（buildRouteFaq）と同じ関数を使い、
  // 画面の文言と JSON-LD の回答文を一致させる（2026-09-02）。
  const parking = buildParkingInfo(route, spots);
  // 犬連れメモ（PetInfoGrid）からは駐車場を外す。同じ文が同一ページに二度出るのを避けるため。
  // 公開93本すべて parking 以外のキーを持つため、これで犬連れメモが消えるルートは無い（DB実測）。
  const petInfoWithoutParking = petInfo ? { ...petInfo, parking: undefined } : null;
  const elevationGainFromPet = petInfo?.elevation_gain
    ? Number(String(petInfo.elevation_gain).replace(/[^0-9.-]/g, "")) || null
    : null;
  const elevationGain = route.elevation_gain_meters ?? elevationGainFromPet;

  // C5（箱根DMO許諾条件）: hero/gallery が Google由来写真のため、同一ページに Googleマップを併設。
  // area型は施設中心、line型は出発地点を中心に表示。座標が無ければ非表示。
  const gmapLat = (isArea ? areaInfo?.area_center_lat : null) ?? route.start_lat;
  const gmapLng = (isArea ? areaInfo?.area_center_lng : null) ?? route.start_lng;
  // parseRouteLocation は start_location 欠落時に 0 を入れる（sentinel）。
  // 0,0（null island）を明示的に除外して誤った地点の埋め込みを防ぐ。
  const hasGmap =
    Number.isFinite(gmapLat) &&
    Number.isFinite(gmapLng) &&
    gmapLat !== 0 &&
    gmapLng !== 0;

  return (
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
        <Link href="/" style={{ color: "inherit" }}>トップ</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/areas" style={{ color: "inherit" }}>エリア一覧</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link
          href={`/areas/${route.areas.slug}`}
          style={{ color: "inherit" }}
        >
          {route.areas.name}
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text-secondary)" }}>
          {route.name}
        </span>
      </nav>

      {/* ヒーロー画像 */}
      {route.thumbnail_url && (
        <div
          className="relative overflow-hidden mb-8"
          style={{
            aspectRatio: "4 / 3",
            borderRadius: "var(--radius-ww-sm)",
            backgroundColor: "var(--color-ww-bg-secondary)",
          }}
        >
          <Image
            src={route.thumbnail_url}
            alt={route.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      {/* タイトル・エリア */}
      <header>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-ww-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-ww-text-secondary)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "9999px",
                backgroundColor: levelDotColors[route.difficulty_level],
                display: "inline-block",
              }}
            />
            {difficultyLabels[route.difficulty_level]}
          </span>
          <Link
            href={`/areas/${route.areas.slug}`}
            style={{
              fontSize: 13,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            {route.areas.name}
          </Link>
          </div>
          <RouteActions
            routeId={route.id}
            routeSlug={route.slug}
            routeName={route.name}
            areaName={route.areas.name}
          />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.35,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
          }}
        >
          {route.name}
        </h1>

        {/* 施策③: 4点スペックバー */}
        <SpecBar
          distanceLabel={distanceLabel}
          minutes={route.estimated_minutes}
          elevationGain={elevationGain}
          difficulty={route.difficulty_level}
          isArea={isArea}
        />
      </header>

      {/* 投稿ルートの出所クレジット＋確認レベルバッジ（origin='submission'・A-2/決定8/23） */}
      {isSubmission && (
        <div style={{ marginTop: 20 }}>
          <SubmissionCredit
            submitterName={route.submitter_display_name}
            guardianOptIn={route.guardian_opt_in}
            confidenceLevel={route.confidence_level}
          />
        </div>
      )}

      {/* E-E-A-T: 運営・編集バイライン（誰が編集し、いつ更新したか）＋実走報告（決定19） */}
      <div style={{ marginTop: 20 }}>
        <TrustByline
          updatedAt={route.updated_at}
          lastWalkedAt={route.last_walked_at}
          lastReportName={route.last_report_display_name}
        />
      </div>

      {/* Cross統一③: ヘッダー直下の Web→App 文脈付き導線 */}
      <WalkInAppCTA sourcePage="route_detail" />

      {/* 直接回答型冒頭文（AI Overview / GEO最適化） */}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: "var(--color-ww-text-secondary)",
          marginBottom: 32,
          padding: "16px 20px",
          backgroundColor: "var(--color-ww-bg-secondary)",
          borderRadius: "var(--radius-ww-md)",
        }}
      >
        {isArea ? (
          <>
            「{route.name}」は、{route.areas.name}にある園内散策コースです。
            滞在目安は約{route.estimated_minutes}分、
            {difficultyLabels[route.difficulty_level]}コースで、
            {route.cart_friendly ? "カート走行可。" : ""}
            {parking.parkingText ? `駐車場: ${parking.parkingText}` : ""}
            {spots.length > 0 ? `園内に${spots.length}件の見どころがあります。` : ""}
          </>
        ) : (
          <>
            「{route.name}」は、{route.areas.name}にある距離{distanceLabel}・所要約{route.estimated_minutes}分の犬連れ散歩コースです。
            {difficultyLabels[route.difficulty_level]}コースで、
            {route.cart_friendly ? "カート走行可。" : ""}
            {parking.parkingText ? `駐車場: ${parking.parkingText}` : ""}
            {spots.length > 0 ? `コース上に${spots.length}件の犬連れスポットがあります。` : ""}
          </>
        )}
      </p>

      {/* 見頃キャプション（C2: best_season を表に出す） */}
      <SeasonHighlight bestSeason={petInfo?.best_season} />

      {/* 体験ストーリー */}
      {route.description && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 20,
            }}
          >
            このコースの体験
          </h2>
          <p
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.85,
              color: "var(--color-ww-text)",
              whiteSpace: "pre-line",
            }}
          >
            {route.description}
          </p>
        </section>
      )}

      {/* ルートマップ */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 28,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            marginBottom: 20,
          }}
        >
          ルートマップ
        </h2>
        <RouteMapWrapper
          coordinates={coordinates}
          startLat={route.start_lat}
          startLng={route.start_lng}
          routeName={route.name}
          spots={mapSpots}
          routeType={route.route_type}
          areaPolygon={areaInfo?.area_polygon ?? null}
          areaCenterLat={areaInfo?.area_center_lat ?? null}
          areaCenterLng={areaInfo?.area_center_lng ?? null}
          areaRadiusM={areaInfo?.area_radius_m ?? null}
        />
        {hasGmap && (
          <div style={{ marginTop: 16 }}>
            <GoogleMapEmbed
              query={`${gmapLat},${gmapLng}`}
              title={`${route.name}の場所（Googleマップ）`}
              zoom={15}
              height={280}
              caption={
                isArea
                  ? "施設の場所（地図：Googleマップ）"
                  : "出発地点（地図：Googleマップ）"
              }
            />
          </div>
        )}
      </section>

      {/* コースガイド（line型）= 歩く順の写真旅程に統合（旧コースガイド＋おすすめスポット） */}
      {!isArea && spots.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 24,
            }}
          >
            コースガイド
          </h2>
          <RouteItinerary spots={itinerarySpots} isArea={false} routeSlug={route.slug} />
        </section>
      )}

      {/* 見どころ（area型）= 順序のない写真カード一覧 */}
      {isArea && spots.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 24,
            }}
          >
            見どころ
          </h2>
          <RouteItinerary spots={itinerarySpots} isArea={true} routeSlug={route.slug} />
        </section>
      )}

      {/* 駐車場（2026-09-02 新設）。「〇〇 駐車場」で来た読者に画面上でも見出し付きで答える。
          GSC 6-8月で駐車場クエリ 1,892表示・1クリック。従来は可視の見出しが無く、
          pet_info の駐車場は犬連れメモの小ラベルに埋もれていた。 */}
      <RouteParking info={parking} />

      {/* 犬連れメモ（施策④ アイコングリッド）。
          pet_info はキー単位で空にする運用があるため、petInfo が非nullでも
          実際に描画する項目が0件なら見出しだけの空枠になる。
          hasPetInfoContent で中身の有無を判定してから見出しごと非表示にする（2026-08-03）。 */}
      {petInfoWithoutParking && hasPetInfoContent(petInfoWithoutParking) && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 20,
            }}
          >
            犬連れメモ
          </h2>
          <PetInfoGrid petInfo={petInfoWithoutParking} />
        </section>
      )}

      {/* コミュニティノート + フィードバック */}
      <RouteFeedback routeId={route.id} routeSlug={route.slug} />

      {/* ギャラリー */}
      {route.gallery_images && route.gallery_images.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 20,
            }}
          >
            ギャラリー
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {route.gallery_images.map((img, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "1 / 1",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "var(--radius-ww-sm)",
                  backgroundColor: "var(--color-ww-bg-secondary)",
                }}
              >
                <Image
                  src={img}
                  alt={`${route.name} の写真 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 関連ルート（Phase 2-B Step 5-B・直帰率改善 41%→35% 目標） */}
      <RelatedRoutes currentRoute={route} />

      {/* 同エリア全コースのテキストリンク索引（鎌倉内部リンク救済・2026-06-04）
          兄弟6本以上のエリアのみ描画。沈んでいる高表示ページに内部リンクを均等配分する。 */}
      <AreaRouteLinks currentRoute={route} />

      {/* 箱根のコースだけ、犬連れ施設マップ /hakone/dog-map への文脈リンクを出す
          （箱根関連ページ同士の相互リンク・2026-09-02）。
          DMO 名義はこのページに持ち込まない（公開ページは SupportedBadge = 後援表記のみ）。 */}
      {isHakoneAreaSlug(route.areas.slug) && <HakoneDogMapLink />}

      {/* CTA */}
      <div style={{ marginTop: 48 }}>
        <WalksAppCTA sourcePage="route_detail" />
      </div>

      <SupportedBadge />

      {/* 構造化データ（editorial=TouristTrip/TouristAttraction。決定18で submission は Article+author に分岐） */}
      {!isSubmission && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": isArea ? "TouristAttraction" : "TouristTrip",
            name: route.name,
            description: route.description,
            touristType: ["犬連れ", "ペット同伴"],
            author: ORG_REF,
            publisher: ORG_REF,
            additionalType: isArea ? "DogFriendlyArea" : "DogFriendlyRoute",
            image: route.thumbnail_url ?? undefined,
            // area型は施設中心座標、line型は出発地点
            geo:
              isArea && areaInfo?.area_center_lat != null && areaInfo?.area_center_lng != null
                ? {
                    "@type": "GeoCoordinates",
                    latitude: areaInfo.area_center_lat,
                    longitude: areaInfo.area_center_lng,
                  }
                : route.start_lat && route.start_lng
                  ? {
                      "@type": "GeoCoordinates",
                      latitude: route.start_lat,
                      longitude: route.start_lng,
                    }
                  : undefined,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
              availability: "https://schema.org/InStock",
            },
            // area型: 順序なし見どころList / line型: 番号付きitinerary
            ...(isArea
              ? {
                  amenityFeature: spots
                    .filter((s) => s.lat != null && s.lng != null)
                    .map((spot) => ({
                      "@type": "LocationFeatureSpecification",
                      name: spot.name,
                      value: spot.description ?? undefined,
                    })),
                }
              : {
                  itinerary: {
                    "@type": "ItemList",
                    itemListElement: spots.map((spot, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      name: spot.name,
                      description: spot.description,
                      ...(spot.lat && spot.lng
                        ? {
                            item: {
                              "@type": "Place",
                              name: spot.name,
                              geo: {
                                "@type": "GeoCoordinates",
                                latitude: spot.lat,
                                longitude: spot.lng,
                              },
                            },
                          }
                        : {}),
                    })),
                  },
                }),
          }),
        }}
      />
      )}

      {/* 投稿ルートの構造化データ（origin='submission'・Article+author／決定18・A-5）。
          守り人表示に同意した投稿者は author=Person、未同意は発行者 Organization。 */}
      {isSubmission && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: route.name,
              description: route.description ?? route.meta_description ?? undefined,
              image: route.thumbnail_url ?? undefined,
              author:
                route.guardian_opt_in && route.submitter_display_name
                  ? { "@type": "Person", name: route.submitter_display_name }
                  : ORG_REF,
              publisher: ORG_REF,
              datePublished: route.created_at,
              dateModified: route.updated_at,
              about: { "@type": "Thing", name: `${route.areas.name} 犬連れ散歩` },
            }),
          }}
        />
      )}

      {/* FAQ構造化データ（ルート固有・動的生成） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: buildRouteFaq(route, spots, distanceLabel, isArea),
          }),
        }}
      />

      {/* WebPage（発行者 author/publisher + 公開日/更新日 = E-E-A-T Freshness） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageSchema({
              path: `/routes/${route.slug}`,
              name: route.name,
              description: route.meta_description ?? route.description,
              datePublished: route.created_at,
              dateModified: route.updated_at,
              primaryImage: route.thumbnail_url,
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
              { name: "エリア一覧", path: "/areas" },
              { name: route.areas.name, path: `/areas/${route.areas.slug}` },
              { name: route.name, path: `/routes/${route.slug}` },
            ])
          ),
        }}
      />
    </article>
  );
}

