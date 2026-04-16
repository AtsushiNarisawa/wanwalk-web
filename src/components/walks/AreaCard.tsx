import Image from "next/image";
import Link from "next/link";

type Props = {
  slug: string;
  name: string;
  routeCount: number;
  heroImageUrl: string | null;
};

export default function AreaCard({ slug, name, routeCount, heroImageUrl }: Props) {
  return (
    <Link href={`/areas/${slug}`} className="group block">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "4 / 3", borderRadius: "var(--radius-ww-sm)" }}
      >
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-opacity duration-300 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundColor: "var(--color-ww-bg-secondary)",
              color: "var(--color-ww-text-tertiary)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-ww-serif)",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {name}
            </span>
          </div>
        )}
      </div>
      <div className="pt-3">
        <h3
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            lineHeight: 1.4,
            marginBottom: 4,
          }}
        >
          {name}
        </h3>
        <p
          className="ww-numeric"
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-ww-text-secondary)",
            letterSpacing: "0.02em",
          }}
        >
          {routeCount}コース
        </p>
      </div>
    </Link>
  );
}
