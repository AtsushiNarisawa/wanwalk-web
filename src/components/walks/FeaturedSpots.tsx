import Image from "next/image";
import type { RouteSpot, DogPolicy } from "@/types/walks";

const SIZE_LABELS: Record<string, string> = {
  all: "全犬種OK",
  small_medium: "中型犬以下",
  small_only: "小型犬のみ",
};

function DogPolicyBadge({ policy }: { policy: DogPolicy }) {
  const tags: string[] = [];
  if (policy.size) tags.push(SIZE_LABELS[policy.size] ?? policy.size);
  if (policy.indoor && policy.terrace) tags.push("店内・テラスOK");
  else if (policy.indoor) tags.push("店内OK");
  else if (policy.terrace) tags.push("テラスのみ");
  if (policy.leash_required) tags.push("リード必須");
  if (policy.carrier_required) tags.push("キャリー必須");
  if (policy.dog_fee && policy.dog_fee !== "無料") tags.push(policy.dog_fee);
  if (tags.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-ww-accent)",
            backgroundColor: "var(--color-ww-accent-soft)",
            padding: "3px 8px",
            borderRadius: "var(--radius-ww-sm)",
            lineHeight: 1.4,
          }}
        >
          {tag}
        </span>
      ))}
      {policy.notes && (
        <p
          style={{
            width: "100%",
            fontSize: 12,
            color: "var(--color-ww-text-secondary)",
            lineHeight: 1.6,
            marginTop: 2,
          }}
        >
          {policy.notes}
        </p>
      )}
    </div>
  );
}

/** おすすめスポットに表示するカテゴリ（infrastructure系は除外） */
const FEATURED_CATEGORIES = new Set([
  "viewpoint",
  "cafe",
  "restaurant",
  "park",
  "shop",
  "dog_run",
]);

interface FeaturedSpotsProps {
  spots: RouteSpot[];
}

export default function FeaturedSpots({ spots }: FeaturedSpotsProps) {
  const featured = spots
    .filter((s) => s.category && FEATURED_CATEGORIES.has(s.category))
    .filter((s) => s.photo_url || s.description)
    .sort((a, b) => {
      // 写真ありを先、なしを後
      if (a.photo_url && !b.photo_url) return -1;
      if (!a.photo_url && b.photo_url) return 1;
      return (a.spot_order ?? 0) - (b.spot_order ?? 0);
    });

  if (featured.length === 0) return null;

  const usedPhotos = new Set<string>();

  return (
    <div>
      {featured.map((spot) => {
        let photoUrl = spot.photo_url;
        if (photoUrl && usedPhotos.has(photoUrl)) {
          photoUrl = null;
        }
        if (photoUrl) usedPhotos.add(photoUrl);
        const hasPhoto = !!photoUrl;

        return (
          <article
            key={spot.id}
            style={{
              marginBottom: hasPhoto ? 40 : 0,
              paddingBottom: hasPhoto ? 40 : 20,
              borderBottom: "1px solid var(--color-ww-border, #e8e5e0)",
            }}
          >
            <div style={{ paddingTop: 20 }}>
              <h3
                style={{
                  fontFamily: "var(--font-ww-sans)",
                  fontSize: hasPhoto ? 22 : 17,
                  fontWeight: 600,
                  color: "var(--color-ww-text)",
                  lineHeight: 1.5,
                  marginBottom: spot.description ? 8 : 0,
                }}
              >
                {spot.name}
              </h3>
              {spot.description && (
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
                  {spot.description}
                </p>
              )}
              {spot.dog_policy && <DogPolicyBadge policy={spot.dog_policy} />}
            </div>
            {hasPhoto && (
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "var(--radius-ww-sm)",
                  backgroundColor: "var(--color-ww-bg-secondary)",
                  aspectRatio: "16 / 9",
                  width: "100%",
                  marginTop: 16,
                }}
              >
                <Image
                  src={photoUrl!}
                  alt={spot.name}
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover"
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
