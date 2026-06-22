import { Flower, Sun, Leaf, Snowflake } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";

// ルート全体の「見頃」キャプション（pet_info.best_season を表に出す＝C2 ルート単位）。
// best_season はフリーテキスト（例「春（4〜5月ポピー100万本）」）。現状は FAQ と犬連れメモにのみ
// 埋もれているため、本文の先頭付近で1行のスキャナブルな見頃キャプションとして提示する。
// 誠実性: 季節の見頃という事実情報のみ。「実走」「現地確認」とは書かない。

function seasonIcon(value: string): Icon {
  if (/春|桜|梅|flower/i.test(value)) return Flower;
  if (/夏|新緑|青葉|summer/i.test(value)) return Sun;
  if (/秋|紅葉|autumn|fall/i.test(value)) return Leaf;
  if (/冬|雪|winter/i.test(value)) return Snowflake;
  return Leaf;
}

export default function SeasonHighlight({ bestSeason }: { bestSeason?: string | null }) {
  const value = bestSeason?.trim();
  if (!value) return null;
  const SeasonIcon = seasonIcon(value);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        marginBottom: 32,
        backgroundColor: "var(--color-ww-accent-soft)",
        borderRadius: "var(--radius-ww-md)",
      }}
    >
      <SeasonIcon
        size={20}
        weight="regular"
        style={{ color: "var(--color-ww-accent)", flexShrink: 0 }}
      />
      <p
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--color-ww-text)",
          margin: 0,
        }}
      >
        <span style={{ fontWeight: 600 }}>見頃</span>
        <span style={{ margin: "0 8px", color: "var(--color-ww-text-tertiary)" }}>·</span>
        {value}
      </p>
    </div>
  );
}
