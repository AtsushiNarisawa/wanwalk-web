"use client";

/**
 * 箱根 犬連れおでかけマップβ のクライアント親。
 * カテゴリフィルタ（4群）＋並び替え（おすすめ順／エリア順）の useState を持ち、
 * 地図 + 凡例兼フィルタ + 施設カード一覧を統括する。
 *
 * ■ 中立を設計で体現
 *   - あいうえお順＝施設名の五十音（ja ロケール）順。距離順・人気順のような序列を持ち込まず、
 *     誰が見ても順位でないと分かる中立な並び。手動の序列カラムは持たない。
 *   - エリア順＝サブエリアの地理順（湯本→芦ノ湖）。順位ではなく地理。各エリア内もあいうえお順。
 *   - フィルタチップ＝凡例。4群すべて同一スタイル（色のみカテゴリで変わる）。
 *
 * ■ スマホでの長さ対策
 *   エリア順では各エリアを折りたたみ（既定は畳む）。初期はエリア見出し＋交通案内だけが並び、
 *   タップで施設カードを展開する。スマホでも短く一覧できる。
 */
import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CaretDown, Car, ArrowRight } from "@phosphor-icons/react";
import type { DirectoryGroup, DirectoryPlace } from "@/types/directory";
import { DIRECTORY_GROUPS, DIRECTORY_GROUP_ORDER, groupOfPlace } from "@/lib/walks/directory-groups";
import {
  groupPlacesByArea,
  splitAreaDescription,
  type DirectorySortMode,
} from "@/lib/walks/directory-areas";
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

const GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 20,
};

export default function HakoneDogMapView({ places }: { places: DirectoryPlace[] }) {
  const [active, setActive] = useState<Set<DirectoryGroup>>(
    () => new Set(DIRECTORY_GROUP_ORDER)
  );
  const [sortMode, setSortMode] = useState<DirectorySortMode>("area");
  const [openAreas, setOpenAreas] = useState<Set<string>>(() => new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 群ごとの件数（凡例チップ表示用）。
  const groupCounts = useMemo(() => {
    const counts: Record<DirectoryGroup, number> = { stay: 0, eat: 0, play: 0, onsen: 0 };
    for (const p of places) counts[groupOfPlace(p)] += 1;
    return counts;
  }, [places]);

  // あいうえお順（施設名・ja ロケール）。エリア順でも各エリア内はこの順序を保つ。
  const ordered = useMemo(
    () => [...places].sort((a, b) => a.name.localeCompare(b.name, "ja")),
    [places]
  );

  const visible = ordered.filter((p) => active.has(groupOfPlace(p)));
  const areaGroups = useMemo(() => groupPlacesByArea(visible), [visible]);
  const allAreaSlugs = useMemo(() => areaGroups.map((g) => g.area.slug), [areaGroups]);

  const toggleGroup = (g: DirectoryGroup) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const toggleArea = (slug: string) => {
    setOpenAreas((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const allOpen = allAreaSlugs.length > 0 && allAreaSlugs.every((s) => openAreas.has(s));
  const toggleAllAreas = () => {
    setOpenAreas(allOpen ? new Set() : new Set(allAreaSlugs));
  };

  const selectPlace = (id: string) => {
    const place = places.find((p) => p.id === id);
    // フィルタで隠れている場合はカテゴリを表示。
    const g = place ? groupOfPlace(place) : null;
    if (g && !active.has(g)) {
      setActive((prev) => new Set(prev).add(g));
    }
    // エリア順で畳まれている場合は該当エリアを開く。
    if (sortMode === "area" && place?.area?.slug) {
      setOpenAreas((prev) => new Set(prev).add(place.area!.slug));
    }
    setHighlightedId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedId(null), 2400);
    // レイアウト確定後にスクロール。
    setTimeout(() => {
      document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const renderCardGrid = (list: DirectoryPlace[]) => (
    <div style={GRID_STYLE}>
      {list.map((p) => (
        <DirectoryPlaceCard key={p.id} place={p} highlighted={highlightedId === p.id} />
      ))}
    </div>
  );

  const segBtn = (mode: DirectorySortMode, label: string): React.CSSProperties => ({
    appearance: "none",
    border: "none",
    padding: "7px 16px",
    borderRadius: "var(--radius-ww-sm)",
    backgroundColor: sortMode === mode ? "var(--color-ww-bg)" : "transparent",
    color: sortMode === mode ? "var(--color-ww-text)" : "var(--color-ww-text-secondary)",
    fontFamily: "var(--font-ww-sans)",
    fontSize: 13,
    fontWeight: sortMode === mode ? 600 : 500,
    cursor: "pointer",
    boxShadow: sortMode === mode ? "0 1px 2px rgba(42,42,42,0.06)" : "none",
  });

  return (
    <div>
      {/* 凡例兼カテゴリフィルタ */}
      <div
        role="group"
        aria-label="カテゴリで絞り込む"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}
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

      {/* 並び替えトグル */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: "var(--color-ww-text-tertiary)" }}>並び替え</span>
        <div
          role="group"
          aria-label="並び替え"
          style={{
            display: "inline-flex",
            padding: 3,
            gap: 2,
            backgroundColor: "var(--color-ww-bg-secondary)",
            border: "1px solid var(--color-ww-border-subtle)",
            borderRadius: "var(--radius-ww-md)",
          }}
        >
          <button type="button" aria-pressed={sortMode === "area"} onClick={() => setSortMode("area")} style={segBtn("area", "エリア順")}>
            エリア順
          </button>
          <button type="button" aria-pressed={sortMode === "name"} onClick={() => setSortMode("name")} style={segBtn("name", "あいうえお順")}>
            あいうえお順
          </button>
        </div>
      </div>

      {/* 地図 */}
      <HakoneDogMap places={places} activeGroups={Array.from(active)} onSelectPlace={selectPlace} />

      {/* 並び順の明示（中立: 順位ではない） */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          margin: "20px 0 12px",
        }}
      >
        <p style={{ fontSize: 12, color: "var(--color-ww-text-tertiary)", margin: 0, lineHeight: 1.6 }}>
          {sortMode === "area"
            ? `${visible.length}件をエリア別に表示中。エリアは地理順・施設はあいうえお順で、施設の優劣を示すものではありません。`
            : `${visible.length}件をあいうえお順で表示中。掲載順は施設の優劣・おすすめ度を示すものではありません。`}
        </p>
        {sortMode === "area" && areaGroups.length > 0 && (
          <button
            type="button"
            onClick={toggleAllAreas}
            style={{
              appearance: "none",
              border: "none",
              background: "none",
              color: "var(--color-ww-accent)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {allOpen ? "すべて閉じる" : "すべて開く"}
          </button>
        )}
      </div>

      {/* 施設カード */}
      {visible.length === 0 ? (
        <p style={{ color: "var(--color-ww-text-secondary)", fontSize: 14, padding: "24px 0" }}>
          表示するカテゴリが選ばれていません。上のボタンでカテゴリを選んでください。
        </p>
      ) : sortMode === "name" ? (
        renderCardGrid(visible)
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {areaGroups.map(({ area, places: areaPlaces }) => {
            const open = openAreas.has(area.slug);
            const { intro, access } = splitAreaDescription(area.description);
            const isReal = area.slug !== "__other__";
            return (
              <section
                key={area.slug}
                style={{
                  border: "1px solid var(--color-ww-border-subtle)",
                  borderRadius: "var(--radius-ww-md)",
                  overflow: "hidden",
                  backgroundColor: "var(--color-ww-bg)",
                }}
              >
                {/* 見出し（クリックで開閉） */}
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleArea(area.slug)}
                  style={{
                    appearance: "none",
                    border: "none",
                    background: "none",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    padding: "16px 20px 0",
                    display: "block",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-ww-serif)",
                        fontSize: 22,
                        fontWeight: 600,
                        color: "var(--color-ww-text)",
                        letterSpacing: "0.01em",
                        margin: 0,
                      }}
                    >
                      {area.name}
                    </h2>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span className="numeric" style={{ fontSize: 13, color: "var(--color-ww-text-secondary)" }}>
                        {areaPlaces.length}件
                      </span>
                      <CaretDown
                        size={18}
                        weight="regular"
                        aria-hidden
                        style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--color-ww-text-tertiary)" }}
                      />
                    </span>
                  </div>
                  {intro && (
                    <p style={{ fontSize: 13, color: "var(--color-ww-text-secondary)", margin: "8px 0 0", lineHeight: 1.7 }}>
                      {intro}
                    </p>
                  )}
                </button>

                {/* 交通案内（常時表示・既存の渋滞回避文を再利用） */}
                {access && (
                  <div style={{ padding: "10px 20px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Car size={18} weight="regular" aria-hidden style={{ color: "var(--color-ww-accent)", flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12.5, color: "var(--color-ww-text-secondary)", margin: 0, lineHeight: 1.7 }}>
                      <span style={{ fontWeight: 600, color: "var(--color-ww-text)" }}>アクセス</span>　{access}
                    </p>
                  </div>
                )}

                {/* このエリアの散歩ルートへの導線 */}
                {isReal && (
                  <div style={{ padding: "10px 20px 0" }}>
                    <Link
                      href={`/areas/${area.slug}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color: "var(--color-ww-accent)" }}
                    >
                      {area.name}の散歩ルートを見る
                      <ArrowRight size={15} weight="regular" aria-hidden />
                    </Link>
                  </div>
                )}

                {/* 展開トグル + カード */}
                <div style={{ padding: "12px 20px 20px" }}>
                  {open ? (
                    renderCardGrid(areaPlaces)
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleArea(area.slug)}
                      style={{
                        appearance: "none",
                        width: "100%",
                        padding: "10px 16px",
                        borderRadius: "var(--radius-ww-md)",
                        border: "1px solid var(--color-ww-border-subtle)",
                        backgroundColor: "var(--color-ww-bg-secondary)",
                        color: "var(--color-ww-text)",
                        fontFamily: "var(--font-ww-sans)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      施設を見る（{areaPlaces.length}件）
                      <CaretDown size={16} weight="regular" aria-hidden />
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
