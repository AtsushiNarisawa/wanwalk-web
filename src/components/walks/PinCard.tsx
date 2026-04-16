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
      style={{
        marginBottom: hasPhoto ? 40 : 0,
        paddingBottom: hasPhoto ? 40 : 20,
        borderBottom: "1px solid var(--color-ww-border, #e8e5e0)",
      }}
    >
      {hasPhoto && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-ww-sm)",
            backgroundColor: "var(--color-ww-bg-secondary)",
            aspectRatio: "16 / 9",
            width: "100%",
            marginBottom: 20,
          }}
        >
          <Image
            src={photoUrl!}
            alt={title}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}
      <div style={{ paddingTop: hasPhoto ? 0 : 20 }}>
        {showIndex && (
          <div
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: "var(--color-ww-accent)",
              marginBottom: 4,
            }}
          >
            {numberLabel}
            {typeLabel ? `  ·  ${typeLabel}` : null}
          </div>
        )}
        <h3
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: hasPhoto ? 22 : 17,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            lineHeight: 1.5,
            marginBottom: comment ? 8 : 0,
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
    </article>
  );
}
