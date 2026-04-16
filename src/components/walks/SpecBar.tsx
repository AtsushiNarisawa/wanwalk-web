import { Path, Clock, Mountains, ChartLineUp } from "@phosphor-icons/react/dist/ssr";

type Props = {
  distanceKm: string;
  minutes: number;
  elevationGain: number | null;
  difficulty: "easy" | "moderate" | "hard";
};

const difficultyMap = {
  easy: { label: "初級", color: "var(--color-ww-level-easy)" },
  moderate: { label: "中級", color: "var(--color-ww-level-moderate)" },
  hard: { label: "上級", color: "var(--color-ww-level-hard)" },
} as const;

export default function SpecBar({
  distanceKm,
  minutes,
  elevationGain,
  difficulty,
}: Props) {
  const diff = difficultyMap[difficulty];

  return (
    <div
      className="spec-bar"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
        padding: 20,
        backgroundColor: "var(--color-ww-bg-secondary)",
        borderRadius: "var(--radius-ww-md)",
        margin: "24px 0 40px 0",
      }}
    >
      <SpecItem icon={<Path size={24} weight="regular" />} value={`${distanceKm} km`} label="距離" />
      <SpecItem icon={<Clock size={24} weight="regular" />} value={`約${minutes}分`} label="所要時間" />
      <SpecItem
        icon={<Mountains size={24} weight="regular" />}
        value={elevationGain != null ? `+${elevationGain}m` : "—"}
        label="高低差"
      />
      <SpecItem
        icon={<ChartLineUp size={24} weight="regular" />}
        value={diff.label}
        label="難易度"
        dotColor={diff.color}
      />
      <style>{`
        @media (min-width: 640px) {
          .spec-bar {
            grid-template-columns: repeat(4, 1fr) !important;
            padding: 24px 32px !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

function SpecItem({
  icon,
  value,
  label,
  dotColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  dotColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <div style={{ color: "var(--color-ww-text)", marginBottom: 10 }}>{icon}</div>
      <div
        className="ww-numeric"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-ww-sans)",
          fontSize: 22,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          marginBottom: 4,
          letterSpacing: "0.01em",
        }}
      >
        {dotColor && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "9999px",
              backgroundColor: dotColor,
              display: "inline-block",
            }}
          />
        )}
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-ww-text-secondary)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
