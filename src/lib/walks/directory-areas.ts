/**
 * 箱根 犬連れおでかけマップβ — エリア順表示の設定。
 *
 * - 表示順は「玄関口（湯本）から山側へ」の地理順。順位（おすすめ度）ではない＝中立。
 *   仙石原（DogHub 所在）が先頭に来ない並びにして中立性の優位経路を残さない。
 * - 交通案内は areas.description の CEO 監修文（エリア紹介＋渋滞回避の運転経路）を再利用する。
 *   DMO の「国道1号線の渋滞緩和」の意図に既存文がそのまま乗る（HAKONE_DOGMAP 申し送り）。
 */
import type { DirectoryArea, DirectoryPlace } from "@/types/directory";

// 箱根サブエリアの地理順（湯本→宮ノ下→強羅→仙石原→芦ノ湖）。
export const HAKONE_AREA_ORDER: string[] = [
  "hakone-yumoto",
  "hakone-miyanoshita",
  "hakone-gora",
  "hakone-sengokuhara",
  "hakone-ashinoko",
];

/**
 * areas.description を「エリア紹介」と「アクセス（交通案内）」に分割する。
 * description は "{紹介}。{アクセス文…}" 形式（最初の句点までが紹介）。
 * 分割できない場合は全文を intro として返す。
 */
export function splitAreaDescription(
  description: string | null | undefined
): { intro: string | null; access: string | null } {
  if (!description) return { intro: null, access: null };
  const idx = description.indexOf("。");
  if (idx < 0 || idx === description.length - 1) {
    return { intro: description.trim() || null, access: null };
  }
  const intro = description.slice(0, idx + 1).trim();
  const access = description.slice(idx + 1).trim();
  return { intro: intro || null, access: access || null };
}

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
      description: null,
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
