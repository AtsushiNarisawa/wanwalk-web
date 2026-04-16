import {
  Car,
  Toilet,
  Drop,
  House,
  RoadHorizon,
  Leaf,
  Sun,
  Snowflake,
  Flower,
  Stairs,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import type { PetInfo } from "@/types/walks";

type Props = { petInfo: PetInfo };
type PhosphorIcon = ComponentType<IconProps>;

function seasonIcon(value: string): PhosphorIcon {
  if (/春|桜|flower/i.test(value)) return Flower;
  if (/夏|新緑|summer/i.test(value)) return Sun;
  if (/秋|紅葉|autumn|fall/i.test(value)) return Leaf;
  if (/冬|雪|winter/i.test(value)) return Snowflake;
  return Leaf;
}

export default function PetInfoGrid({ petInfo }: Props) {
  type Item = { label: string; value: string; Icon: PhosphorIcon };
  const items: Item[] = [];

  if (petInfo.parking) items.push({ label: "駐車場", value: petInfo.parking, Icon: Car });
  if (petInfo.restroom) items.push({ label: "トイレ", value: petInfo.restroom, Icon: Toilet });
  if (petInfo.water_station) items.push({ label: "水飲み場", value: petInfo.water_station, Icon: Drop });
  if (petInfo.pet_facilities) items.push({ label: "ペット施設", value: petInfo.pet_facilities, Icon: House });
  if (petInfo.surface) items.push({ label: "路面", value: petInfo.surface, Icon: RoadHorizon });
  if (petInfo.best_season) items.push({ label: "ベストシーズン", value: petInfo.best_season, Icon: seasonIcon(petInfo.best_season) });
  if (petInfo.stairs) items.push({ label: "階段", value: petInfo.stairs, Icon: Stairs });

  if (items.length === 0) return null;

  return (
    <div
      className="pet-info-grid"
      style={{
        backgroundColor: "var(--color-ww-bg-secondary)",
        borderRadius: "var(--radius-ww-md)",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "1fr",
        columnGap: 40,
        rowGap: 24,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <item.Icon
            size={24}
            weight="regular"
            color="var(--color-ww-accent)"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-ww-sans)",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-ww-text-secondary)",
                marginBottom: 4,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-ww-sans)",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.7,
                color: "var(--color-ww-text)",
                whiteSpace: "pre-line",
              }}
            >
              {item.value}
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @media (min-width: 768px) {
          .pet-info-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            padding: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
