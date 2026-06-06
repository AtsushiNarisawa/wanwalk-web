/**
 * 施設ディレクトリ（directory_places）のデータ層 — 箱根 犬連れおでかけマップβ。
 *
 * - 施設は directory_places_with_latlng ビュー（lat/lng 露出）から取得。
 * - 「ここから歩ける最寄りルート」は get_directory_nearest_routes RPC で
 *   region 内全施設分を 1 往復で取得し、place_id でグループ化して各施設に結合する
 *   （PostGIS KNN を DB 側に閉じ込め、44 回のラウンドトリップを避ける）。
 *
 * ⚠️ β 段階の RLS は anon read using(true) のため、is_published=false の β 行も
 *    anon（サーバ）から読める。一般公開時に using(is_published) へ絞り、
 *    ドラフトは service role 読みへ切り替える（HAKONE_DOGMAP_SPEC §10-8・今回スコープ外）。
 */
import { cache } from "react";
import { wanwalkSupabase as supabase } from "./supabase";
import type { DirectoryArea, DirectoryPlace, NearestRoute } from "@/types/directory";

const DIRECTORY_SELECT =
  "id, region, area_id, name, category, subcategory, lat, lng, description, dog_policy, photo_url, official_url, phone, price_range, opening_hours, verified_at, utm_slug, is_published";

type NearestRow = {
  place_id: string;
  slug: string;
  name: string;
  dist_m: number;
};

type AreaRow = { id: string; slug: string; name: string; description: string | null };

// 施設が参照するエリアを id → {slug,name,description} で取得（エリア順表示・交通案内用）。
async function fetchAreasByIds(ids: string[]): Promise<Map<string, DirectoryArea>> {
  const map = new Map<string, DirectoryArea>();
  if (ids.length === 0) return map;
  const { data, error } = await supabase
    .from("areas")
    .select("id, slug, name, description")
    .in("id", ids);
  if (error || !data) return map;
  for (const a of data as AreaRow[]) {
    map.set(a.id, { slug: a.slug, name: a.name, description: a.description });
  }
  return map;
}

/**
 * region 内の施設を、最寄りルート（距離昇順 3 本）を結合して返す。
 * 既定では region='hakone'。β は is_published 不問（全 hakone 行）で読む。
 */
export const getDirectoryPlaces = cache(
  async (region: string = "hakone"): Promise<DirectoryPlace[]> => {
    const [placesRes, nearestRes] = await Promise.all([
      supabase
        .from("directory_places_with_latlng")
        .select(DIRECTORY_SELECT)
        .eq("region", region)
        .order("name"),
      supabase.rpc("get_directory_nearest_routes", {
        p_region: region,
        p_limit: 3,
      }),
    ]);

    if (placesRes.error || !placesRes.data) return [];

    // 施設が参照するエリアをまとめて取得（id → エリア）。
    const areaIds = Array.from(
      new Set(
        (placesRes.data as unknown as DirectoryPlace[])
          .map((p) => p.area_id)
          .filter((id): id is string => typeof id === "string")
      )
    );
    const areasById = await fetchAreasByIds(areaIds);

    // place_id → 最寄りルート（距離昇順）。
    const nearestByPlace = new Map<string, NearestRoute[]>();
    if (!nearestRes.error && Array.isArray(nearestRes.data)) {
      for (const row of nearestRes.data as NearestRow[]) {
        // place_id は DB では uuid。JS は文字列化して返すが、念のため String() で
        // 正規化し directory_places.id（同形式）と確実に突合させる。
        const key = String(row.place_id);
        const list = nearestByPlace.get(key) ?? [];
        list.push({ slug: row.slug, name: row.name, dist_m: Math.round(row.dist_m) });
        nearestByPlace.set(key, list);
      }
      for (const list of nearestByPlace.values()) {
        list.sort((a, b) => a.dist_m - b.dist_m);
      }
    }

    return (placesRes.data as unknown as DirectoryPlace[]).map((p) => ({
      ...p,
      nearest_routes: nearestByPlace.get(String(p.id)) ?? [],
      area: p.area_id ? areasById.get(p.area_id) ?? null : null,
    }));
  }
);
