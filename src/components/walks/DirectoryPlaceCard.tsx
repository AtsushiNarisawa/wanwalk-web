"use client";

/**
 * 箱根 犬連れおでかけマップβ の施設カード。
 *
 * ■ 中立を設計で体現
 *   全カードは完全同一構造。PR/おすすめ/序列バッジは持たない。
 *   DogHub もリトナも他施設と同じ 1 カード。群バッジの色だけがカテゴリで変わる（序列ではない）。
 *
 * ■ 構成
 *   写真 / 群バッジ＋カテゴリ / 施設名 / 犬条件（チップ＋全文 notes・誇張しない）/
 *   営業時間（折りたたみ）/ 公式サイト（utm 付与＋outbound_click 計測）/
 *   ここから歩ける最寄りルート 3 本（距離付き・内部リンク）/ 確認日＋免責。
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Path, Phone } from "@phosphor-icons/react";
import type { DirectoryPlace } from "@/types/directory";
import {
  DIRECTORY_GROUPS,
  DIRECTORY_CATEGORY_LABELS,
  buildOutboundUrl,
  formatDirectoryDogChips,
  groupOfPlace,
  isConditional,
} from "@/lib/walks/directory-groups";
import { formatSpotDistance } from "@/lib/walks/format";
import { trackEvent } from "@/lib/analytics";

// "+81 460-83-8800" → "tel:+81460838800"（タップ発信用に空白・ハイフン除去）
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+0-9]/g, "")}`;
}

const VERIFIED_LABEL = "情報は2026年6月時点・最新は公式サイトでご確認ください。";

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
  const chips = formatDirectoryDogChips(place.dog_policy, place.category);
  const conditional = isConditional(place.dog_policy);
  const notes = place.dog_policy?.notes?.trim() || null;
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
        ) : null}
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

        {/* 犬条件: チップ + 条件付きマーカー */}
        {(chips.length > 0 || conditional) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {conditional && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-ww-text-secondary)",
                  backgroundColor: "var(--color-ww-bg-tertiary)",
                  borderRadius: "var(--radius-ww-sm)",
                  padding: "3px 8px",
                }}
              >
                条件付き
              </span>
            )}
            {chips.map((c) => (
              <span
                key={c}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-ww-accent)",
                  backgroundColor: "var(--color-ww-accent-soft)",
                  borderRadius: "var(--radius-ww-sm)",
                  padding: "3px 8px",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* 犬条件の全文（誇張せず一次情報を提示） */}
        {notes && (
          <p
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--color-ww-text-secondary)",
              margin: 0,
            }}
          >
            {notes}
          </p>
        )}

        {/* 価格帯・営業時間 */}
        {(place.price_range || place.opening_hours) && (
          <div style={{ fontSize: 12, color: "var(--color-ww-text-tertiary)" }}>
            {place.price_range && <span>価格帯 {place.price_range}</span>}
            {place.opening_hours && (
              <details style={{ marginTop: 4 }}>
                <summary style={{ cursor: "pointer", color: "var(--color-ww-text-secondary)" }}>
                  営業時間
                </summary>
                <div style={{ whiteSpace: "pre-line", marginTop: 4, lineHeight: 1.6 }}>
                  {place.opening_hours}
                </div>
              </details>
            )}
          </div>
        )}

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
            {VERIFIED_LABEL}
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
