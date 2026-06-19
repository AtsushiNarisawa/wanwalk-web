import { MapTrifold } from "@phosphor-icons/react/dist/ssr";

/**
 * Google由来の写真を掲載する画面に Googleマップを同時表示するための軽量埋め込み
 * （箱根DMO連携の許諾条件・HAKONE_DMO_SPRINT_CTO_SPEC C5・案B）。
 *
 * - API キー不要・課金ゼロの公開埋め込み（output=embed）を使用。Maps JS API ではない。
 * - iframe 埋め込みは next/image ではないため next.config の remotePatterns 追加は不要。
 * - server component（インタラクション無し・静的 iframe）。
 */
type Props = {
  /** "緯度,経度"（例 "35.20,139.02"）または地名（例 "箱根"）。 */
  query: string;
  /** iframe の title（アクセシビリティ）。 */
  title: string;
  zoom?: number;
  height?: number;
  /** 地図下の補足キャプション。既定は「地図：Googleマップ」。 */
  caption?: string;
};

export default function GoogleMapEmbed({
  query,
  title,
  zoom = 14,
  height = 320,
  caption,
}: Props) {
  const q = encodeURIComponent(query);
  const embedSrc = `https://maps.google.com/maps?q=${q}&z=${zoom}&hl=ja&output=embed`;
  const linkHref = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-ww-md)",
          border: "1px solid var(--color-ww-border-subtle)",
        }}
      >
        <iframe
          title={title}
          src={embedSrc}
          width="100%"
          height={height}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0, display: "block" }}
        />
      </div>
      <p
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "var(--color-ww-text-tertiary)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <MapTrifold size={14} weight="regular" />
        {caption ?? "地図：Googleマップ"}
        <a
          href={linkHref}
          target="_blank"
          rel="noopener"
          style={{ color: "var(--color-ww-accent)" }}
        >
          Googleマップで開く
        </a>
      </p>
    </div>
  );
}
