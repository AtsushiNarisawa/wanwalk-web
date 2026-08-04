/**
 * 施設ディレクトリ（directory_places）のデータ層 — 箱根 犬連れおでかけマップβ。
 *
 * - 施設は directory_places_with_latlng ビュー（lat/lng 露出）から取得。
 * - 「ここから歩ける最寄りルート」は get_directory_nearest_routes RPC で
 *   region 内全施設分を 1 往復で取得し、place_id でグループ化して各施設に結合する
 *   （PostGIS KNN を DB 側に閉じ込め、44 回のラウンドトリップを避ける）。
 *
 * 公開行のみ表示する。RLS を using(is_published) に締め済み（A1）＋本データ層でも
 *    .eq("is_published", true) で二重に絞る（多層防御）。未公開ドラフトは
 *    service role 読みでのみ取得する（HAKONE_DOGMAP_SPEC §10-8）。
 */
import { cache } from "react";
import { wanwalkSupabase as supabase } from "./supabase";
import type { DirectoryArea, DirectoryPlace, NearestRoute } from "@/types/directory";

// RSC ペイロード漏れ対策（2026-08-05）: /hakone/dog-map の描画チェーン（page.tsx → HakoneDogMapView
// → HakoneDogMap / DirectoryPlaceCard、すべて Client Component）は取得した行をほぼそのまま props で
// 渡すため、SELECT した列は描画有無に関わらず配信 HTML（RSC ペイロード）にシリアライズされる。
// dog_policy（size/status/leash_required/carrier_required/dog_fee/notes 等）・price_range・
// opening_hours はどのコンポーネントからも参照されていない
//（DirectoryPlaceCard.tsx / HakoneDogMap.tsx のコメント参照。犬の同伴条件・価格帯・営業時間は
//  2026-07-28/08-02 CEO 確定で非表示化済みだが、このページはその後の 637dada 全数走査の対象外
//  だったため列だけ残っていた）。DB のカラム・型（DirectoryPlace.dog_policy 等）は温存し、
// このページの取得列からのみ外す＝表示は1ミリも変えない完全に可逆な対応。
const DIRECTORY_SELECT =
  "id, region, area_id, name, category, subcategory, extra_groups, lat, lng, description, photo_url, official_url, phone, verified_at, utm_slug, is_published";

type NearestRow = {
  place_id: string;
  slug: string;
  name: string;
  dist_m: number;
};

type AreaRow = {
  id: string;
  slug: string;
  name: string;
  directory_intro: string | null;
  directory_access: string | null;
};

// 施設が参照するエリアを id → {slug,name,紹介,アクセス} で取得（エリア順表示・交通案内用）。
// ⚠️ areas.description（公開サイト /areas の SEO 資産）は読まない。このマップの文面は
//    directory_intro / directory_access（マップ専用列）が正本。未投入なら null のまま出さない。
async function fetchAreasByIds(ids: string[]): Promise<Map<string, DirectoryArea>> {
  const map = new Map<string, DirectoryArea>();
  if (ids.length === 0) return map;
  const [areasRes, routesRes] = await Promise.all([
    supabase
      .from("areas")
      .select("id, slug, name, directory_intro, directory_access")
      .in("id", ids),
    // 「このエリアの散歩ルートを見る」導線の出し分け用。公開ルートが 0 本のエリア
    //（例: 箱根町外をまとめた「箱根周辺」）へは /areas/{slug} リンクを出さない
    //（公開側でそのエリアページは 404 にしているため、出すとリンク切れになる）。
    // PostgREST の nested count フィルタは過去にバグ実績があるため使わず、
    // 素の行を引いて JS 側で集約する。
    supabase
      .from("official_routes")
      .select("area_id")
      .eq("is_published", true)
      .in("area_id", ids),
  ]);

  const areasWithRoutes = new Set<string>();
  if (!routesRes.error && Array.isArray(routesRes.data)) {
    for (const r of routesRes.data as { area_id: string | null }[]) {
      if (r.area_id) areasWithRoutes.add(r.area_id);
    }
  }

  if (areasRes.error || !areasRes.data) return map;
  for (const a of areasRes.data as AreaRow[]) {
    map.set(a.id, {
      slug: a.slug,
      name: a.name,
      directory_intro: a.directory_intro ?? null,
      directory_access: a.directory_access ?? null,
      has_routes: areasWithRoutes.has(a.id),
    });
  }
  return map;
}

/**
 * region 内の施設を、最寄りルート（距離昇順 3 本）を結合して返す。
 * 既定では region='hakone'。公開行のみ（is_published=true）で絞る（RLS と二重）。
 */
export const getDirectoryPlaces = cache(
  async (region: string = "hakone"): Promise<DirectoryPlace[]> => {
    const [placesRes, nearestRes] = await Promise.all([
      supabase
        .from("directory_places_with_latlng")
        .select(DIRECTORY_SELECT)
        .eq("region", region)
        .eq("is_published", true) // RLS(A1)と二重で公開行のみ。未公開ドラフトは service role 読みのみ。
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
