"use client";

/**
 * 箱根 犬連れおでかけマップ の施設カード。
 *
 * ■ 中立を設計で体現
 *   全カードは完全同一構造。PR/おすすめ/序列バッジは持たない。
 *   DogHub もリトナも他施設と同じ 1 カード。群バッジの色だけがカテゴリで変わる（序列ではない）。
 *
 * ■ 構成
 *   写真 / 群バッジ＋カテゴリ / 施設名 / 施設の説明（description）/
 *   公式サイト（utm 付与＋outbound_click 計測）/
 *   ここから歩ける最寄りルート 3 本（距離付き・内部リンク）/ 確認日＋免責。
 *
 * ■ 載せないもの（DB は無変更＝表示だけ止める可逆な対応）
 *   - 価格帯・営業時間（2026-07-28）: 変動が早く欠損も多いため公式サイトへ一本化
 *   - 犬条件の全文（dog_policy.notes）（2026-07-28）
 *   - 犬の同伴条件そのもの（2026-08-02 CEO 確定）: 受入サイズ・同伴できる場所・
 *     リード/キャリーの要否・ペット料金・ワクチン要件。施設ごとにばらつきがあり変わるため、
 *     条件は一切載せずページ冒頭の一文で公式サイトへ誘導する。
 *     dog_policy の取得・型は温存（表示だけ落とす）。
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Path, Phone } from "@phosphor-icons/react";
import type { DirectoryPlace } from "@/types/directory";
import {
  DIRECTORY_GROUPS,
  DIRECTORY_CATEGORY_LABELS,
  buildOutboundUrl,
  groupOfPlace,
} from "@/lib/walks/directory-groups";
import { formatSpotDistance } from "@/lib/walks/format";
import { trackEvent } from "@/lib/analytics";

// "+81 460-83-8800" → "tel:+81460838800"（タップ発信用に空白・ハイフン除去）
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+0-9]/g, "")}`;
}

// 確認日はカードごとに異なる（施設を追加・再確認したタイミングで verified_at が動く）。
// 固定文言だと実際の確認日とズレるため、その施設の verified_at から年月で組み立てる。
// verified_at が無い施設は日付を断定せず「最新は公式サイトで」だけを出す。
function verifiedLabel(verifiedAt: string | null): string {
  const suffix = "最新は公式サイトでご確認ください。";
  if (!verifiedAt) return suffix;
  const m = /^(\d{4})-(\d{2})/.exec(verifiedAt);
  if (!m) return suffix;
  return `情報は${m[1]}年${Number(m[2])}月時点・${suffix}`;
}

// アグリゲーター型の必須動線「情報の修正・削除はこちら」の問い合わせ先（WanWalk/DogHub 運営受付）。
const CORRECTION_EMAIL = "info@dog-hub.shop";

export default function DirectoryPlaceCard({
  place,
  highlighted = false,
}: {
  place: DirectoryPlace;
  highlighted?: boolean;
}) {
  const group = groupOfPlace(place);
  const def = DIRECTORY_GROUPS[group];
  const nearest = place.nearest_routes ?? [];

  // 修正・削除依頼メール（件名に施設名＋utm_slug を自動付与）。全カード同一＝中立。
  const correctionSubject = `【箱根 愛犬とおでかけマップ】情報の修正・削除依頼: ${place.name}${
    place.utm_slug ? ` (${place.utm_slug})` : ""
  }`;
  const correctionMailto = `mailto:${CORRECTION_EMAIL}?subject=${encodeURIComponent(correctionSubject)}`;

  return (
    <article
      id={`place-${place.id}`}
      style={{
        scrollMarginTop: 24,
        backgroundColor: "var(--color-ww-bg)",
        border: highlighted
          ? "1px solid var(--color-ww-accent)"
          : "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
        overflow: "hidden",
        transition: "border-color 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 写真 */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          backgroundColor: "var(--color-ww-bg-secondary)",
        }}
      >
        {place.photo_url ? (
          <Image
            src={place.photo_url}
            alt={place.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 360px"
          />
        ) : (
          // 写真なし施設のプレースホルダー（2026-08-04・空箱にしない）。
          // 施設名は下部の見出しで既に出るため、枠内はカテゴリのアイコンのみ（二重表示を避ける）。
          // アイコンは地図ピン（HakoneDogMap.tsx）と同じ DIRECTORY_GROUPS[group].iconPath を再利用。
          // 色は DESIGN_TOKENS の「非活性・プレースホルダ」用トークン（text-tertiary）で統一。
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              width={40}
              height={40}
              fill="var(--color-ww-text-tertiary)"
            >
              <path d={def.iconPath} />
            </svg>
          </div>
        )}
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {/* 群バッジ + カテゴリ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-ww-sans)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "9999px",
                backgroundColor: def.color,
                display: "inline-block",
              }}
            />
            {def.label}
          </span>
          <span style={{ color: "var(--color-ww-text-tertiary)", fontSize: 12 }}>
            {DIRECTORY_CATEGORY_LABELS[place.category]}
          </span>
        </div>

        {/* 施設名 */}
        <h3
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.45,
            color: "var(--color-ww-text)",
            margin: 0,
          }}
        >
          {place.name}
        </h3>

        {/* 施設の説明（description）。「これは何の施設か」だけを伝える概要。
            全カード同一構造・全文表示（行数の切り詰めや「続きを読む」は入れない＝中立）。 */}
        {place.description && (
          <p
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 14,
              lineHeight: 1.8,
              color: "var(--color-ww-text)",
              margin: 0,
            }}
          >
            {place.description}
          </p>
        )}

        {/* 犬の同伴条件はカードに一切載せない（2026-08-02 CEO 確定）。
            受入サイズ・同伴できる場所・リード/キャリーの要否・ペット料金・ワクチン要件は、
            施設ごとにばらつきがあり変わるため、条件チップも条件付きマーカーも出さない。
            誘導はページ冒頭の一文（/hakone/dog-map）＋各カードの「公式サイトを見る」に一本化する。
            価格帯・営業時間・dog_policy.notes も同じ理由で非表示（2026-07-28）。
            DB の dog_policy / price_range / opening_hours とデータ取得は温存＝表示だけ止める可逆な対応。 */}

        {/* 公式サイト・電話（流出導線。全施設同一スタイル＝中立） */}
        {(place.official_url || place.phone) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {place.official_url && (
              <a
                href={buildOutboundUrl(place.official_url)}
                target="_blank"
                rel="noopener nofollow"
                onClick={() => {
                  // place は施設識別子（utm_slug）で統一。欠損時は送らない（UUID と粒度を混ぜない）。
                  trackEvent("outbound_click", {
                    place: place.utm_slug ?? undefined,
                    group,
                    category: place.category,
                    surface: "hakone_dogmap",
                    channel: "web",
                  });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  minHeight: 40,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-ww-md)",
                  border: "1px solid var(--color-ww-border-strong)",
                  backgroundColor: "var(--color-ww-bg)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--color-ww-text)",
                }}
              >
                公式サイトを見る
                <ArrowUpRight size={16} weight="regular" aria-hidden />
              </a>
            )}
            {place.phone && (
              <a
                href={telHref(place.phone)}
                onClick={() => {
                  trackEvent("outbound_click", {
                    place: place.utm_slug ?? undefined,
                    group,
                    category: place.category,
                    surface: "hakone_dogmap",
                    channel: "phone",
                  });
                }}
                aria-label={`${place.name}に電話する`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  minHeight: 40,
                  padding: "8px 14px",
                  borderRadius: "var(--radius-ww-md)",
                  border: "1px solid var(--color-ww-border-subtle)",
                  backgroundColor: "var(--color-ww-bg)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--color-ww-text-secondary)",
                }}
              >
                <Phone size={16} weight="regular" aria-hidden />
                電話
              </a>
            )}
          </div>
        )}

        {/* ここから歩ける最寄りルート */}
        {nearest.length > 0 && (
          <div
            style={{
              marginTop: "auto",
              paddingTop: 12,
              borderTop: "1px solid var(--color-ww-border-subtle)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-ww-text-secondary)",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Path size={16} weight="regular" aria-hidden />
              ここから歩ける散歩ルート
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {nearest.map((r) => (
                <li key={r.slug} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                  <Link
                    href={`/routes/${r.slug}`}
                    onClick={() => {
                      trackEvent("directory_route_click", {
                        place: place.utm_slug ?? undefined,
                        route_slug: r.slug,
                        surface: "hakone_dogmap",
                      });
                    }}
                    style={{ fontSize: 13, color: "var(--color-ww-text)", lineHeight: 1.5 }}
                  >
                    {r.name}
                  </Link>
                  <span
                    className="numeric"
                    style={{ fontSize: 12, color: "var(--color-ww-text-tertiary)", whiteSpace: "nowrap" }}
                  >
                    {formatSpotDistance(r.dist_m)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 免責 ＋ アグリゲーター型の「情報の修正・削除」動線（全カード同一＝中立） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 11, color: "var(--color-ww-text-tertiary)", margin: 0, lineHeight: 1.6 }}>
            {verifiedLabel(place.verified_at)}
          </p>
          <a
            href={correctionMailto}
            onClick={() =>
              trackEvent("directory_correction_click", {
                place: place.utm_slug ?? undefined,
                surface: "hakone_dogmap",
                channel: "web",
              })
            }
            style={{
              width: "fit-content",
              fontSize: 11,
              color: "var(--color-ww-text-tertiary)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            情報の修正・削除はこちら
          </a>
        </div>
      </div>
    </article>
  );
}
