import { DeviceMobile } from "@phosphor-icons/react/dist/ssr";

export default function WalksAppCTA() {
  return (
    <section
      className="text-center"
      style={{
        backgroundColor: "var(--color-ww-bg-secondary)",
        border: "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
        padding: "48px 24px",
      }}
    >
      <div
        className="inline-flex items-center justify-center mb-6"
        style={{
          width: 56,
          height: 56,
          color: "var(--color-ww-accent)",
          borderBottom: "1px solid var(--color-ww-border-subtle)",
          paddingBottom: 8,
        }}
      >
        <DeviceMobile size={28} weight="regular" />
      </div>
      <h2
        className="ww-serif mb-4"
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 24,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          letterSpacing: "0.02em",
          lineHeight: 1.4,
        }}
      >
        WanWalkアプリ Coming Soon
      </h2>
      <p
        className="mx-auto mb-6"
        style={{
          maxWidth: 520,
          fontSize: 14,
          lineHeight: 1.75,
          color: "var(--color-ww-text-secondary)",
        }}
      >
        WanWalkアプリなら、散歩ルートをGPSで自動記録。
        歩いた距離や時間を振り返りながら、愛犬との時間を残せます。
      </p>
      <div
        className="inline-flex items-center justify-center"
        style={{
          padding: "10px 20px",
          border: "1px solid var(--color-ww-border-strong)",
          borderRadius: "var(--radius-ww-md)",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--color-ww-text-secondary)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        App Store で近日公開予定
      </div>
    </section>
  );
}
