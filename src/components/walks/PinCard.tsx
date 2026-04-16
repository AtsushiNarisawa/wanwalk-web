import Image from "next/image";

type Props = {
  index: number;
  title: string;
  comment: string | null;
  photoUrl: string | null;
  pinType?: string | null;
  /** 番号ラベルを表示するか（みどころ=true、おすすめスポット=false） */
  showIndex?: boolean;
};

const pinTypeLabels: Record<string, string> = {
  start: "スタート",
  scenic: "景色",
  photo_spot: "撮影スポット",
  facility: "施設",
  end: "ゴール",
  cafe: "カフェ",
  rest: "休憩",
};

export default function PinCard({
  index,
  title,
  comment,
  photoUrl,
  pinType,
  showIndex = true,
}: Props) {
  const numberLabel = index.toString().padStart(2, "0");
  const typeLabel = pinType ? pinTypeLabels[pinType] ?? null : null;
  const hasPhoto = !!photoUrl;

  return (
    <article
      className={`pin-card ${hasPhoto ? "pin-card--has-photo" : "pin-card--text-only"}`}
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: 32,
        borderBottom: "1px solid var(--color-ww-border, #e8e5e0)",
        paddingBottom: 32,
      }}
    >
      {hasPhoto && (
        <div
          className="pin-card-image"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-ww-sm)",
            backgroundColor: "var(--color-ww-bg-secondary)",
            flexShrink: 0,
            aspectRatio: "4 / 3",
            width: "100%",
          }}
        >
          <Image
            src={photoUrl!}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
          />
        </div>
      )}
      <div
        className="pin-card-body"
        style={{
          paddingTop: hasPhoto ? 16 : 0,
          flex: 1,
        }}
      >
        {showIndex && (
          <div
            className="ww-numeric"
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ww-accent)",
              marginBottom: 6,
            }}
          >
            {numberLabel}
            {typeLabel ? `  ·  ${typeLabel}` : null}
          </div>
        )}
        <h3
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: hasPhoto ? 20 : 17,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            lineHeight: 1.5,
            marginBottom: comment ? 10 : 0,
          }}
        >
          {title}
        </h3>
        {comment && (
          <p
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: hasPhoto ? 16 : 15,
              fontWeight: 400,
              lineHeight: 1.75,
              color: "var(--color-ww-text-secondary, #555)",
              whiteSpace: "pre-line",
            }}
          >
            {comment}
          </p>
        )}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .pin-card--has-photo {
            flex-direction: row !important;
            gap: 32px;
            align-items: flex-start;
          }
          .pin-card--has-photo .pin-card-image {
            width: 280px !important;
            aspect-ratio: 1 / 1 !important;
          }
          .pin-card--has-photo .pin-card-body {
            padding-top: 8px !important;
          }
          .pin-card--text-only {
            flex-direction: column !important;
          }
        }
      `}</style>
    </article>
  );
}
