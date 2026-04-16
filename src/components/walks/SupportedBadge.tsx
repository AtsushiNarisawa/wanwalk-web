export default function SupportedBadge() {
  return (
    <div className="py-10 text-center">
      <div
        className="inline-flex items-center gap-3"
        style={{
          fontSize: 11,
          color: "var(--color-ww-text-tertiary)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 28,
            height: 1,
            backgroundColor: "var(--color-ww-border-subtle)",
            display: "inline-block",
          }}
        />
        <span>Supported by 箱根DMO</span>
        <span
          aria-hidden
          style={{
            width: 28,
            height: 1,
            backgroundColor: "var(--color-ww-border-subtle)",
            display: "inline-block",
          }}
        />
      </div>
    </div>
  );
}
