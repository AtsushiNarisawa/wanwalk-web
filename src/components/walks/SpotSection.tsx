import Image from "next/image";
import type { RouteSpot, DogPolicy, SpotCategory } from "@/types/walks";
import {
  Coffee,
  ForkKnife,
  Tree,
  Dog,
  Drop,
  Toilet,
  Car,
  Binoculars,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";

const CATEGORY_CONFIG: Record<
  SpotCategory,
  { icon: Icon; label: string; simple?: boolean }
> = {
  cafe: { icon: Coffee, label: "カフェ" },
  restaurant: { icon: ForkKnife, label: "レストラン" },
  park: { icon: Tree, label: "公園・自然" },
  dog_run: { icon: Dog, label: "ドッグラン" },
  water_station: { icon: Drop, label: "水飲み場", simple: true },
  restroom: { icon: Toilet, label: "トイレ", simple: true },
  parking: { icon: Car, label: "駐車場", simple: true },
  viewpoint: { icon: Binoculars, label: "景観ポイント" },
  shop: { icon: Storefront, label: "ショップ" },
};

// カテゴリの表示順序
const CATEGORY_ORDER: SpotCategory[] = [
  "viewpoint",
  "park",
  "cafe",
  "restaurant",
  "shop",
  "dog_run",
  "parking",
  "restroom",
  "water_station",
];

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

function SpotCard({
  spot,
  photoUrl,
  simple,
}: {
  spot: RouteSpot;
  photoUrl: string | null;
  simple: boolean;
}) {
  if (simple) {
    return (
      <div
        style={{
          padding: "12px 0",
          borderBottom: "1px solid var(--color-ww-border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--color-ww-text)",
          }}
        >
          {spot.name}
        </span>
        {spot.distance_from_start != null && (
          <span
            style={{
              fontSize: 12,
              color: "var(--color-ww-text-tertiary)",
              fontFeatureSettings: '"tnum"',
            }}
          >
            スタートから{spot.distance_from_start}m
          </span>
        )}
      </div>
    );
  }

  return (
    <article
      style={{
        paddingBottom: 24,
        marginBottom: 24,
        borderBottom: "1px solid var(--color-ww-border-subtle)",
      }}
    >
      <h4
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 17,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          lineHeight: 1.5,
          marginBottom: spot.description ? 6 : 0,
        }}
      >
        {spot.name}
      </h4>
      {spot.description && (
        <p
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.75,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          {spot.description}
        </p>
      )}
      {spot.dog_policy && <DogPolicyBadge policy={spot.dog_policy} />}
      {photoUrl && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-ww-sm)",
            backgroundColor: "var(--color-ww-bg-secondary)",
            aspectRatio: "16 / 9",
            width: "100%",
            marginTop: 12,
          }}
        >
          <Image
            src={photoUrl}
            alt={spot.name}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}
    </article>
  );
}

interface SpotSectionProps {
  spots: RouteSpot[];
}

export default function SpotSection({ spots }: SpotSectionProps) {
  // 写真の重複除去
  const usedPhotos = new Set<string>();
  const spotPhotos = new Map<string, string | null>();
  for (const spot of spots) {
    const raw = spot.photo_url ?? null;
    const url = raw && !usedPhotos.has(raw) ? raw : null;
    if (raw) usedPhotos.add(raw);
    spotPhotos.set(spot.id, url);
  }

  // カテゴリ別グルーピング
  const grouped = new Map<SpotCategory, RouteSpot[]>();
  for (const spot of spots) {
    const cat = (spot.category ?? "viewpoint") as SpotCategory;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(spot);
  }

  // 表示順序に並べる
  const orderedCategories = CATEGORY_ORDER.filter((cat) => grouped.has(cat));

  return (
    <div>
      {orderedCategories.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const catSpots = grouped.get(cat)!;
        const IconComponent = config.icon;

        return (
          <div key={cat} style={{ marginBottom: 36 }}>
            {/* カテゴリ見出し */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid var(--color-ww-border-strong)",
              }}
            >
              <IconComponent
                size={20}
                weight="regular"
                style={{ color: "var(--color-ww-accent)" }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-ww-serif)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--color-ww-text)",
                  letterSpacing: "0.01em",
                }}
              >
                {config.label}
              </h3>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--color-ww-text-tertiary)",
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {catSpots.length}件
              </span>
            </div>
            {/* スポット一覧 */}
            <div>
              {catSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  photoUrl={spotPhotos.get(spot.id) ?? null}
                  simple={!!config.simple}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
