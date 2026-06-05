"use client";

/**
 * 箱根 犬連れおでかけマップβ のクライアント親。
 * フィルタ（4 群トグル）の useState を持ち、地図 + 凡例兼フィルタ + 施設カード一覧を統括する。
 *
 * ■ 中立を設計で体現
 *   - 既定の並び順は「id ハッシュによる固定ランダム順」。距離順・名前順だと特定エリア
 *     （仙石原＝DogHub 所在）が上位に偏るのを避ける。手動の序列カラムは持たない。
 *     順位ではないことを文言で明示する。
 *   - フィルタチップ＝凡例。4 群すべて同一スタイル（色のみカテゴリで変わる）。
 */
import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { DirectoryGroup, DirectoryPlace } from "@/types/directory";
import { DIRECTORY_GROUPS, DIRECTORY_GROUP_ORDER, groupOfPlace } from "@/lib/walks/directory-groups";
import DirectoryPlaceCard from "./DirectoryPlaceCard";

// Leaflet は SSR 非対応のため client wrapper 内で dynamic import（ssr:false）。
const HakoneDogMap = dynamic(() => import("./HakoneDogMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full flex items-center justify-center"
      style={{
        height: 460,
        backgroundColor: "var(--color-ww-bg-secondary)",
        borderRadius: "var(--radius-ww-md)",
        color: "var(--color-ww-text-tertiary)",
      }}
    >
      地図を読み込み中...
    </div>
  ),
});

// 決定的ハッシュ（FNV-1a 32bit）。SSR/クライアントで同一順 → ハイドレーション不一致なし。
// ⚠️ 中立性の担保: seed には施設属性と無関係な id（gen_random_uuid）だけを渡すこと。
//    name / area_id / utm_slug 等に変えると五十音順・地理順のバイアスが静かに復活し、
//    「固定ランダム順＝順位ではない」が壊れる。ソートキーは hashId(place.id) のまま維持する。
function hashId(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function HakoneDogMapView({ places }: { places: DirectoryPlace[] }) {
  const [active, setActive] = useState<Set<DirectoryGroup>>(
    () => new Set(DIRECTORY_GROUP_ORDER)
  );
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 群ごとの件数（凡例チップ表示用）。
  const groupCounts = useMemo(() => {
    const counts: Record<DirectoryGroup, number> = { stay: 0, eat: 0, play: 0, onsen: 0 };
    for (const p of places) counts[groupOfPlace(p)] += 1;
    return counts;
  }, [places]);

  // 固定ランダム順（順位ではない）。
  const ordered = useMemo(
    () => [...places].sort((a, b) => hashId(a.id) - hashId(b.id)),
    [places]
  );

  const visible = ordered.filter((p) => active.has(groupOfPlace(p)));

  const toggleGroup = (g: DirectoryGroup) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const selectPlace = (id: string) => {
    // フィルタで隠れている場合は表示してからスクロール。
    const g = groupOfPlace(places.find((p) => p.id === id) ?? ({} as DirectoryPlace));
    if (g && !active.has(g)) {
      setActive((prev) => new Set(prev).add(g));
    }
    setHighlightedId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedId(null), 2400);
    // レイアウト確定後にスクロール。
    setTimeout(() => {
      document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  return (
    <div>
      {/* 凡例兼フィルタ */}
      <div
        role="group"
        aria-label="カテゴリで絞り込む"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}
      >
        {DIRECTORY_GROUP_ORDER.map((g) => {
          const def = DIRECTORY_GROUPS[g];
          const on = active.has(g);
          return (
            <button
              key={g}
              type="button"
              aria-pressed={on}
              onClick={() => toggleGroup(g)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 14px",
                borderRadius: "var(--radius-ww-md)",
                border: `1px solid ${on ? "var(--color-ww-border-strong)" : "var(--color-ww-border-subtle)"}`,
                backgroundColor: on ? "var(--color-ww-bg)" : "var(--color-ww-bg-secondary)",
                color: on ? "var(--color-ww-text)" : "var(--color-ww-text-tertiary)",
                fontFamily: "var(--font-ww-sans)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                opacity: on ? 1 : 0.7,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "9999px",
                  backgroundColor: def.color,
                  display: "inline-block",
                  border: "1.5px solid #FFFFFF",
                  boxShadow: "0 0 0 1px rgba(42,42,42,0.12)",
                }}
              />
              {def.label}
              <span className="numeric" style={{ color: "var(--color-ww-text-tertiary)", fontSize: 12 }}>
                {groupCounts[g]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 地図 */}
      <HakoneDogMap places={places} activeGroups={Array.from(active)} onSelectPlace={selectPlace} />

      {/* 並び順の明示（中立: 順位ではない） */}
      <p
        style={{
          fontSize: 12,
          color: "var(--color-ww-text-tertiary)",
          margin: "20px 0 12px",
          lineHeight: 1.6,
        }}
      >
        {visible.length}件を表示中。並び順は固定のランダム順で、施設の優劣・おすすめ度を示すものではありません。
      </p>

      {/* 施設カード */}
      {visible.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {visible.map((p) => (
            <DirectoryPlaceCard key={p.id} place={p} highlighted={highlightedId === p.id} />
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--color-ww-text-secondary)", fontSize: 14, padding: "24px 0" }}>
          表示するカテゴリが選ばれていません。上のボタンでカテゴリを選んでください。
        </p>
      )}
    </div>
  );
}
