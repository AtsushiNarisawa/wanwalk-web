import Link from "next/link";
import Image from "next/image";
import { Path, Clock, Users, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import type { OfficialRoute } from "@/types/walks";

const difficultyLabels = {
  easy: "初級",
  moderate: "中級",
  hard: "上級",
};

// DESIGN_TOKENS.md 2.難易度色（2026-04-16更新）準拠
const difficultyStyles: Record<
  "easy" | "moderate" | "hard",
  { bg: string; color: string }
> = {
  easy: { bg: "var(--color-ww-level-easy)", color: "var(--color-ww-text-inverse)" },
  moderate: {
    bg: "var(--color-ww-bg-tertiary)",
    color: "var(--color-ww-text-secondary)",
  },
  hard: { bg: "var(--color-ww-accent-hover)", color: "var(--color-ww-text-inverse)" },
};

export default function RouteCard({ route }: { route: OfficialRoute }) {
  const distanceKm = (route.distance_meters / 1000).toFixed(1);
  const diff = difficultyStyles[route.difficulty_level];

  return (
    <Link
      href={`/routes/${route.slug}`}
      className="group block overflow-hidden transition-colors"
      style={{
        backgroundColor: "var(--color-ww-bg)",
        border: "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
      }}
    >
      <div
        className="aspect-[16/10] relative overflow-hidden"
        style={{ backgroundColor: "var(--color-ww-bg-tertiary)" }}
      >
        {route.thumbnail_url ? (
          <Image
            src={route.thumbnail_url}
            alt={route.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: "var(--color-ww-text-tertiary)" }}
          >
            <ImageSquare size={40} weight="regular" />
          </div>
        )}
        <span
          className="absolute top-3 left-3"
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-ww-sm)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            backgroundColor: diff.bg,
            color: diff.color,
          }}
        >
          {difficultyLabels[route.difficulty_level]}
        </span>
      </div>
      <div className="p-5">
        <h3
          className="mb-3 line-clamp-2"
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            lineHeight: 1.5,
            letterSpacing: "0.01em",
          }}
        >
          {route.name}
        </h3>
        <div
          className="flex items-center flex-wrap gap-4"
          style={{
            fontSize: 12,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Path size={14} weight="regular" />
            <span className="ww-numeric">{distanceKm}</span>km
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} weight="regular" />
            <span className="ww-numeric">{route.estimated_minutes}</span>分
          </span>
          {route.total_walks > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} weight="regular" />
              <span className="ww-numeric">{route.total_walks}</span>人が歩いた
            </span>
          )}
        </div>
        {route.description && (
          <p
            className="mt-3 line-clamp-2"
            style={{
              fontSize: 12,
              color: "var(--color-ww-text-tertiary)",
              lineHeight: 1.7,
            }}
          >
            {route.description}
          </p>
        )}
      </div>
    </Link>
  );
}
