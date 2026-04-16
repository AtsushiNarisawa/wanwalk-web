import Image from "next/image";

type Props = {
  index: number;
  title: string;
  comment: string | null;
  photoUrl: string | null;
  pinType?: string | null;
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

export default function PinCard({ index, title, comment, photoUrl, pinType }: Props) {
  const numberLabel = index.toString().padStart(2, "0");
  const typeLabel = pinType ? pinTypeLabels[pinType] ?? null : null;

  return (
    <article
      className="pin-card"
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: 32,
      }}
    >
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
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-ww-serif)",
              fontSize: 40,
              fontWeight: 700,
              color: "var(--color-ww-accent)",
              backgroundColor: "var(--color-ww-accent-soft)",
            }}
          >
            {numberLabel}
          </div>
        )}
      </div>
      <div
        className="pin-card-body"
        style={{
          paddingTop: 16,
          flex: 1,
        }}
      >
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
        <h3
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            lineHeight: 1.5,
            marginBottom: 10,
          }}
        >
          {title}
        </h3>
        {comment && (
          <p
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.75,
              color: "var(--color-ww-text)",
              whiteSpace: "pre-line",
            }}
          >
            {comment}
          </p>
        )}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .pin-card {
            flex-direction: row !important;
            gap: 32px;
            align-items: flex-start;
          }
          .pin-card-image {
            width: 280px !important;
            aspect-ratio: 1 / 1 !important;
          }
          .pin-card-body {
            padding-top: 8px !important;
          }
        }
      `}</style>
    </article>
  );
}
