/**
 * 箱根 犬連れおでかけマップβ — エリア順表示の設定。
 *
 * - 表示順は「玄関口（湯本）から山側へ」の地理順。順位（おすすめ度）ではない＝中立。
 *   仙石原（DogHub 所在）が先頭に来ない並びにして中立性の優位経路を残さない。
 * - エリア紹介・アクセス案内は areas.directory_intro / directory_access（このマップ専用列）を
 *   そのまま表示する。areas.description（公開サイト /areas の SEO 資産）は参照しない。
 *   ※ かつては description を最初の句点で機械分割していたが、文面を専用列へ分離した
 *     （2026-07-28）。未投入のエリアは該当箇所を出さない（null 安全）。
 */
import type { DirectoryArea, DirectoryPlace } from "@/types/directory";

// 箱根サブエリアの地理順（湯本→宮ノ下→強羅→仙石原→芦ノ湖→箱根周辺）。
// 「箱根周辺」は箱根町外の施設をまとめる末尾エリア（このマップ専用・散歩ルートは0本）。
export const HAKONE_AREA_ORDER: string[] = [
  "hakone-yumoto",
  "hakone-miyanoshita",
  "hakone-gora",
  "hakone-sengokuhara",
  "hakone-ashinoko",
  "hakone-shuhen",
];

export interface AreaGroup {
  area: DirectoryArea;
  places: DirectoryPlace[];
}

/**
 * 施設をサブエリアでグルーピングし、HAKONE_AREA_ORDER の地理順に並べる。
 * 各エリア内の施設順は呼び出し側が決めた順序（固定ランダム）を保つ。
 * order に無いエリアは末尾にエリア名昇順で続ける。area 未設定は除外しない（"その他"扱い）。
 */
export function groupPlacesByArea(
  places: DirectoryPlace[],
  order: string[] = HAKONE_AREA_ORDER
): AreaGroup[] {
  const bySlug = new Map<string, AreaGroup>();
  const OTHER_SLUG = "__other__";

  for (const p of places) {
    const area: DirectoryArea = p.area ?? {
      slug: OTHER_SLUG,
      name: "その他",
      directory_intro: null,
      directory_access: null,
      has_routes: false,
    };
    const g = bySlug.get(area.slug);
    if (g) g.places.push(p);
    else bySlug.set(area.slug, { area, places: [p] });
  }

  const orderIndex = new Map(order.map((slug, i) => [slug, i]));
  return Array.from(bySlug.values()).sort((a, b) => {
    const ai = orderIndex.get(a.area.slug);
    const bi = orderIndex.get(b.area.slug);
    if (ai != null && bi != null) return ai - bi;
    if (ai != null) return -1; // 既知エリアを先に
    if (bi != null) return 1;
    return a.area.name.localeCompare(b.area.name, "ja");
  });
}

// 並び替えモード。
export type DirectorySortMode = "name" | "area";
