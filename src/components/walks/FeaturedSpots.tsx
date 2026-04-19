import Image from "next/image";
import type { RouteSpot, RoutePinWithPhoto, DogPolicy } from "@/types/walks";

/** dog_policy が付与されたカテゴリだけバッジ表示 */
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

interface MergedSpot {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  dogPolicy: DogPolicy | null;
  source: "spot" | "pin" | "merged";
}

function normalizeTitle(s: string): string {
  return s.replace(/[\s　]+/g, "").toLowerCase();
}

/** spots と pins を統合し、名前の重複を排除 */
function mergeSpots(
  spots: RouteSpot[],
  pins: RoutePinWithPhoto[]
): MergedSpot[] {
  const result: MergedSpot[] = [];
  const usedPinIds = new Set<string>();

  // 1. おすすめカテゴリの spots を追加
  const featuredSpots = spots.filter(
    (s) => s.category && FEATURED_CATEGORIES.has(s.category)
  );

  for (const spot of featuredSpots) {
    const normalizedName = normalizeTitle(spot.name);
    // 同名 pin を探す
    const matchingPin = pins.find(
      (p) =>
        normalizeTitle(p.title).includes(normalizedName) ||
        normalizedName.includes(normalizeTitle(p.title))
    );

    if (matchingPin) {
      usedPinIds.add(matchingPin.id);
      result.push({
        id: spot.id,
        title: matchingPin.title,
        // pin の体験文を優先、なければ spot
        description: matchingPin.comment || spot.description,
        // pin の写真を優先、なければ spot
        photoUrl: matchingPin.photo_url || spot.photo_url,
        dogPolicy: spot.dog_policy,
        source: "merged",
      });
    } else if (spot.photo_url || spot.description) {
      result.push({
        id: spot.id,
        title: spot.name,
        description: spot.description,
        photoUrl: spot.photo_url,
        dogPolicy: spot.dog_policy,
        source: "spot",
      });
    }
  }

  // 2. spots に含まれなかった pins を追加
  for (const pin of pins) {
    if (!usedPinIds.has(pin.id)) {
      result.push({
        id: pin.id,
        title: pin.title,
        description: pin.comment,
        photoUrl: pin.photo_url,
        dogPolicy: null,
        source: "pin",
      });
    }
  }

  // 写真ありを先に、なしを後に
  result.sort((a, b) => {
    if (a.photoUrl && !b.photoUrl) return -1;
    if (!a.photoUrl && b.photoUrl) return 1;
    return 0;
  });

  return result;
}

interface FeaturedSpotsProps {
  spots: RouteSpot[];
  pins: RoutePinWithPhoto[];
}

export default function FeaturedSpots({ spots, pins }: FeaturedSpotsProps) {
  const merged = mergeSpots(spots, pins);
  if (merged.length === 0) return null;

  // 写真の重複除去
  const usedPhotos = new Set<string>();

  return (
    <div>
      {merged.map((item) => {
        let photoUrl = item.photoUrl;
        if (photoUrl && usedPhotos.has(photoUrl)) {
          photoUrl = null;
        }
        if (photoUrl) usedPhotos.add(photoUrl);
        const hasPhoto = !!photoUrl;

        return (
          <article
            key={item.id}
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
                  marginBottom: item.description ? 8 : 0,
                }}
              >
                {item.title}
              </h3>
              {item.description && (
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
                  {item.description}
                </p>
              )}
              {item.dogPolicy && <DogPolicyBadge policy={item.dogPolicy} />}
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
                  alt={item.title}
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
