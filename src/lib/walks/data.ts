import { cache } from "react";
import { wanwalkSupabase as supabase } from "./supabase";
import { NON_SEO_SPOT_CATEGORIES } from "@/types/walks";
import type { Area, OfficialRoute, RouteSpot, RouteWithArea, SpotWithRoute, RouteAreaInfo } from "@/types/walks";
import { HAKONE_SUB_AREA_ORDER } from "./area-taxonomy";

const NON_SEO_CATEGORIES_ARR = Array.from(NON_SEO_SPOT_CATEGORIES);

export async function getFeaturedRoute(): Promise<RouteWithArea | null> {
  const { data, error } = await supabase
    .from("featured_routes")
    .select("route_id, label, official_routes!inner(*, areas(id, name, slug, prefecture, description))")
    .eq("is_active", true)
    .eq("official_routes.is_published", true)
    .order("display_order")
    .limit(1);

  if (error || !data || data.length === 0) return null;
  const routeJson = (data[0] as Record<string, unknown>).official_routes;
  if (!routeJson) return null;
  const r = routeJson as Record<string, unknown>;
  return {
    ...parseRouteLocation(r),
    areas: r.areas as unknown as Area,
  } as RouteWithArea;
}

export async function getAreas(): Promise<Area[]> {
  const { data, error } = await supabase
    .from("areas")
    .select("id, name, slug, prefecture, description, tier")
    .not("slug", "is", null)
    .order("prefecture")
    .order("name");

  if (error) return [];
  return data ?? [];
}

export async function getAreaBySlug(slug: string): Promise<Area | null> {
  const { data, error } = await supabase
    .from("areas")
    .select("id, name, slug, prefecture, description, hero_image_url, tier, faq")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getRoutesByAreaId(
  areaId: string
): Promise<OfficialRoute[]> {
  const { data, error } = await supabase
    .from("official_routes")
    .select(
      "id, area_id, name, slug, description, difficulty_level, distance_meters, estimated_minutes, thumbnail_url, pet_info, total_pins, total_walks, is_published, cart_friendly, season_tags, start_location"
    )
    .eq("area_id", areaId)
    .eq("is_published", true)
    .order("name");

  if (error) return [];
  return (data ?? []).map(parseRouteLocation);
}

export async function getFeaturedRoutesForTop(
  limit: number = 12,
): Promise<RouteWithArea[]> {
  const [allRoutes, areasWithCount] = await Promise.all([
    getAllPublishedRoutes(),
    getAreasWithRouteCount(),
  ]);

  const orderedAreas = areasWithCount
    .filter((a) => a.route_count > 0)
    .sort((a, b) => b.route_count - a.route_count);

  const byArea = new Map<string, RouteWithArea[]>();
  for (const r of allRoutes) {
    if (!r.thumbnail_url) continue;
    const list = byArea.get(r.area_id) ?? [];
    list.push(r);
    byArea.set(r.area_id, list);
  }

  const featured: RouteWithArea[] = [];
  let round = 0;
  while (featured.length < limit) {
    let added = false;
    for (const area of orderedAreas) {
      const list = byArea.get(area.id) ?? [];
      if (list[round]) {
        featured.push(list[round]);
        added = true;
        if (featured.length >= limit) break;
      }
    }
    if (!added) break;
    round++;
  }

  return featured;
}

export async function getAllPublishedRoutes(): Promise<RouteWithArea[]> {
  const { data, error } = await supabase
    .from("official_routes")
    .select(
      "id, area_id, name, slug, description, meta_description, difficulty_level, distance_meters, estimated_minutes, elevation_gain_meters, thumbnail_url, gallery_images, pet_info, total_pins, total_walks, is_published, cart_friendly, route_type, season_tags, created_at, updated_at, start_location, areas(id, name, slug, prefecture, description)"
    )
    .eq("is_published", true)
    .order("name");

  if (error) return [];
  return (data ?? []).map((r) => ({
    ...parseRouteLocation(r),
    areas: r.areas as unknown as Area,
  })) as RouteWithArea[];
}

export async function getRouteBySlug(
  slug: string
): Promise<RouteWithArea | null> {
  const { data, error } = await supabase
    .from("official_routes")
    .select(
      "id, area_id, name, slug, description, meta_description, difficulty_level, distance_meters, estimated_minutes, elevation_gain_meters, thumbnail_url, gallery_images, pet_info, total_pins, total_walks, is_published, cart_friendly, cart_notes, route_type, season_tags, created_at, updated_at, start_location, origin, submitter_display_name, submitter_profile_id, guardian_opt_in, confidence_level, source_submission_id, last_walked_at, last_report_display_name, areas(id, name, slug, prefecture, description)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return {
    ...parseRouteLocation(data),
    areas: data.areas as unknown as Area,
  } as RouteWithArea;
}

// 関連ルート取得（Step 5-B）
//
// 4 軸スコアリングで関連度を算出:
//   - 同エリア (area_id 一致): +100
//   - 同季節タグ共通数: +20 / タグ
//   - 同 cart_friendly: +10
//   - 距離レンジ ±30%: +5
// スコア順に上位 maxCount 件返す。is_published=true・自分自身を除く。
export async function getRelatedRoutes(
  current: RouteWithArea,
  maxCount = 4
): Promise<RouteWithArea[]> {
  const { data, error } = await supabase
    .from("official_routes")
    .select(
      "id, area_id, name, slug, description, meta_description, difficulty_level, distance_meters, estimated_minutes, elevation_gain_meters, thumbnail_url, gallery_images, pet_info, total_pins, total_walks, is_published, cart_friendly, route_type, season_tags, created_at, updated_at, start_location, areas(id, name, slug, prefecture, description)"
    )
    .eq("is_published", true)
    .neq("id", current.id);

  if (error || !data) return [];

  const currentTags = new Set(current.season_tags ?? []);
  const currentDistance = current.distance_meters;
  const lowerDist = currentDistance * 0.7;
  const upperDist = currentDistance * 1.3;

  type Scored = { route: RouteWithArea; score: number };
  const scored: Scored[] = data.map((r) => {
    const parsed = parseRouteLocation(r) as OfficialRoute;
    const withArea: RouteWithArea = {
      ...parsed,
      areas: r.areas as unknown as Area,
    };
    let score = 0;
    if (withArea.area_id === current.area_id) score += 100;
    const overlap = (withArea.season_tags ?? []).filter((t) => currentTags.has(t)).length;
    score += overlap * 20;
    if (withArea.cart_friendly === current.cart_friendly) score += 10;
    if (withArea.distance_meters >= lowerDist && withArea.distance_meters <= upperDist) score += 5;
    return { route: withArea, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // タイブレーク: total_walks 多い順 → name 昇順
    if ((b.route.total_walks ?? 0) !== (a.route.total_walks ?? 0)) {
      return (b.route.total_walks ?? 0) - (a.route.total_walks ?? 0);
    }
    return a.route.name.localeCompare(b.route.name, "ja");
  });

  return scored.slice(0, maxCount).map((s) => s.route);
}

export async function getRouteSpots(routeId: string): Promise<RouteSpot[]> {
  // PostgRESTはgeography型をEWKB hexで返すため、view経由で数値lat/lngを取得
  const { data, error } = await supabase
    .from("route_spots_with_latlng")
    .select("*")
    .eq("route_id", routeId)
    .order("spot_order");

  if (error) return [];
  return (data ?? []).map((s) => {
    const { location: _loc, ...rest } = s as Record<string, unknown>;
    return rest as unknown as RouteSpot;
  });
}

export async function getRouteLineCoordinates(
  routeId: string
): Promise<[number, number][]> {
  const { data, error } = await supabase.rpc("get_route_line_coords", {
    route_id: routeId,
  });

  if (error || !data) return [];
  return data;
}

// area型ルートの追加情報を取得。line型でも呼び出し可能（route_type='line'が返る）
export async function getRouteAreaInfo(
  routeId: string
): Promise<RouteAreaInfo | null> {
  const { data, error } = await supabase.rpc("get_route_area_geojson", {
    p_route_id: routeId,
  });

  if (error || !data) return null;
  const raw = data as {
    route_type: "line" | "area";
    area_center_lat: number | null;
    area_center_lng: number | null;
    area_radius_m: number | null;
    area_polygon: { type: string; coordinates: number[][][] } | null;
    area_source: string | null;
  };

  // GeoJSON Polygon: coordinates[0] が外環リング。[lng, lat] → [lat, lng] に変換
  let polygonLatLng: [number, number][] | null = null;
  if (raw.area_polygon?.coordinates?.[0]) {
    polygonLatLng = raw.area_polygon.coordinates[0].map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );
  }

  return {
    route_type: raw.route_type,
    area_center_lat: raw.area_center_lat,
    area_center_lng: raw.area_center_lng,
    area_radius_m: raw.area_radius_m,
    area_polygon: polygonLatLng,
    area_source: raw.area_source,
  };
}

function parseRouteLocation(route: Record<string, unknown>): OfficialRoute {
  const r = route as Record<string, unknown>;
  const startLoc = r.start_location as string | null;
  let start_lat = 0;
  let start_lng = 0;
  if (startLoc && typeof startLoc === "string") {
    const match = startLoc.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
      start_lng = parseFloat(match[1]);
      start_lat = parseFloat(match[2]);
    }
  } else if (startLoc && typeof startLoc === "object") {
    const geo = startLoc as unknown as { coordinates: [number, number] };
    if (geo.coordinates) {
      start_lng = geo.coordinates[0];
      start_lat = geo.coordinates[1];
    }
  }

  const { start_location: _sl, ...rest } = r;
  return {
    ...rest,
    start_lat,
    start_lng,
    distance_meters: Number(r.distance_meters),
  } as OfficialRoute;
}

export async function getAreasWithRouteCount(): Promise<
  (Area & { route_count: number })[]
> {
  const { data, error } = await supabase
    .from("areas")
    .select(
      "id, name, slug, prefecture, description, hero_image_url, tier, official_routes(count)"
    )
    .eq("official_routes.is_published", true)
    .not("slug", "is", null)
    .order("name");

  if (error) return [];

  return (data ?? []).map((a) => {
    const routes = a.official_routes as unknown as { count: number }[];
    return {
      id: a.id,
      name: a.name,
      slug: a.slug,
      prefecture: a.prefecture,
      description: a.description,
      hero_image_url: a.hero_image_url ?? null,
      tier: a.tier,
      route_count: routes?.[0]?.count ?? 0,
    };
  });
}

// /hakone ハブ（箱根 愛犬さんぽマップ）専用。
// group_key='hakone' のサブエリア5件と、その公開ルートをまとめて取得する。
//
// 設計（HAKONE_DMO_SPRINT_CTO_SPEC C1）:
// - PostgREST の nested embed フィルタ（official_routes(...).is_published）は
//   過去にバグ実績があるため使わず（commit e269e98）、エリアごとに既存の
//   getRoutesByAreaId() を呼ぶ（server 側で is_published=true 済）。さらに JS 側でも再フィルタ。
// - 並びは HAKONE_SUB_AREA_ORDER（湯本→宮ノ下→強羅→仙石原→芦ノ湖）。
// - 公開ルート0本のエリアは描画しない（空セクション防止）。
// - generateMetadata と Page 本体の双方から呼ばれるため React.cache でラップ。
export interface HakoneAreaWithRoutes {
  area: Area;
  routes: OfficialRoute[];
}

export const getHakoneAreasWithRoutes = cache(
  async (): Promise<HakoneAreaWithRoutes[]> => {
    const { data: areas, error } = await supabase
      .from("areas")
      .select("id, name, slug, prefecture, description, hero_image_url, tier")
      .eq("group_key", "hakone")
      .not("slug", "is", null);

    if (error || !areas) return [];

    const withRoutes = await Promise.all(
      areas.map(async (area) => ({
        area: area as Area,
        routes: (await getRoutesByAreaId(area.id)).filter(
          (r) => r.is_published === true
        ),
      }))
    );

    const orderIndex = (slug: string): number => {
      const i = (HAKONE_SUB_AREA_ORDER as readonly string[]).indexOf(slug);
      return i < 0 ? 999 : i;
    };

    return withRoutes
      .filter((x) => x.routes.length > 0)
      .sort((a, b) => orderIndex(a.area.slug) - orderIndex(b.area.slug));
  }
);

export async function getRoutePinsWithPhotos(
  routeId: string
): Promise<import("@/types/walks").RoutePinWithPhoto[]> {
  const { data, error } = await supabase
    .from("route_pins")
    .select(
      "id, route_id, title, comment, pin_type, created_at, route_pin_photos(photo_url, display_order)"
    )
    .eq("route_id", routeId)
    .eq("is_official", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((p) => {
    const photos = (p.route_pin_photos ?? []) as unknown as {
      photo_url: string;
      display_order: number | null;
    }[];
    const sorted = [...photos].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    return {
      id: p.id,
      route_id: p.route_id,
      title: p.title,
      comment: p.comment,
      pin_type: p.pin_type,
      photo_url: sorted[0]?.photo_url ?? null,
    };
  });
}

// --- Spot functions ---

function parseSpotLocation(s: Record<string, unknown>): RouteSpot {
  const loc = s.location as string | null;
  let lat: number | null = null;
  let lng: number | null = null;
  if (loc && typeof loc === "string") {
    const m = loc.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (m) {
      lng = parseFloat(m[1]);
      lat = parseFloat(m[2]);
    }
  }
  const { location: _loc, ...rest } = s;
  return { ...rest, lat, lng } as RouteSpot;
}

export async function getAllSpots(): Promise<
  (RouteSpot & { slug: string; route_name: string; route_slug: string; area_name: string; area_slug: string })[]
> {
  const { data, error } = await supabase
    .from("route_spots")
    .select(
      "*, official_routes!inner(name, slug, is_published, areas!inner(name, slug))"
    )
    .not("slug", "is", null)
    .eq("official_routes.is_published", true)
    .not("category", "in", `(${NON_SEO_CATEGORIES_ARR.join(",")})`)
    .order("name");

  if (error) return [];
  return (data ?? []).map((s) => {
    const route = s.official_routes as unknown as {
      name: string;
      slug: string;
      areas: { name: string; slug: string };
    };
    const parsed = parseSpotLocation(s as Record<string, unknown>);
    return {
      ...parsed,
      slug: s.slug as string,
      route_name: route.name,
      route_slug: route.slug,
      area_name: route.areas.name,
      area_slug: route.areas.slug,
    };
  });
}

// /spots ハブ + カテゴリページ用の軽量スポット情報。
// CWV 対策で getAllSpots() の SELECT * を避け、表示に必要な列のみ取得する。
// location/dog_policy/seasonal_notes/photo_metadata 等の重い列は除外。
export type SpotListItem = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  pet_friendly: boolean;
  photo_url: string | null;
  route_name: string;
  route_slug: string;
  route_total_walks: number;
  area_name: string;
  area_slug: string;
};

const LISTING_SELECT =
  "id, name, slug, category, pet_friendly, photo_url, official_routes!inner(name, slug, total_walks, is_published, areas!inner(name, slug))";

function mapToListItem(s: Record<string, unknown>): SpotListItem {
  const route = s.official_routes as unknown as {
    name: string;
    slug: string;
    total_walks: number;
    areas: { name: string; slug: string };
  };
  return {
    id: s.id as string,
    name: s.name as string,
    slug: s.slug as string,
    category: (s.category as string | null) ?? null,
    pet_friendly: Boolean(s.pet_friendly),
    photo_url: (s.photo_url as string | null) ?? null,
    route_name: route.name,
    route_slug: route.slug,
    route_total_walks: route.total_walks ?? 0,
    area_name: route.areas.name,
    area_slug: route.areas.slug,
  };
}

// /spots ハブ用の集計値とサンプル。
// - エリア別件数 (26 エリアまで)
// - カテゴリ別件数
// - 人気スポット ( total_walks 順 / 10件 )
// - 全件 ItemList JSON-LD 用の slug+name 配列
export async function getSpotsListingSummary(
  seoCategories: string[]
): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byArea: { area_slug: string; area_name: string; count: number }[];
  popular: SpotListItem[];
  allForItemList: { name: string; slug: string }[];
}> {
  const { data, error } = await supabase
    .from("route_spots")
    .select(LISTING_SELECT)
    .not("slug", "is", null)
    .in("category", seoCategories)
    .eq("official_routes.is_published", true);

  if (error || !data) {
    return { total: 0, byCategory: {}, byArea: [], popular: [], allForItemList: [] };
  }

  const items = data.map((s) => mapToListItem(s as Record<string, unknown>));
  const byCategory: Record<string, number> = {};
  const areaMap = new Map<string, { area_name: string; count: number }>();
  for (const it of items) {
    if (it.category) byCategory[it.category] = (byCategory[it.category] ?? 0) + 1;
    const a = areaMap.get(it.area_slug);
    if (a) a.count += 1;
    else areaMap.set(it.area_slug, { area_name: it.area_name, count: 1 });
  }
  const byArea = Array.from(areaMap.entries())
    .map(([area_slug, v]) => ({ area_slug, area_name: v.area_name, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const popular = [...items]
    .sort((a, b) => b.route_total_walks - a.route_total_walks)
    .slice(0, 10);

  const allForItemList = items
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
    .map((it) => ({ name: it.name, slug: it.slug }));

  return { total: items.length, byCategory, byArea, popular, allForItemList };
}

// /spots/category/[category] 用: カテゴリ単一の全件取得（ページネーション + JSON-LD 用）。
// page/perPage は呼び出し側でスライス。total はクロウラ用に全件返す前提。
//
// React.cache でラップして同一 request 内で重複 SQL を防ぐ。
// generateMetadata と Page component の両方から呼ばれるため、cache がないと SQL が 2 回走る。
export const getSpotsByCategory = cache(
  async (category: string): Promise<SpotListItem[]> => {
    const { data, error } = await supabase
      .from("route_spots")
      .select(LISTING_SELECT)
      .not("slug", "is", null)
      .eq("category", category)
      .eq("official_routes.is_published", true)
      .order("name");

    if (error || !data) return [];
    return data.map((s) => mapToListItem(s as Record<string, unknown>));
  }
);

export async function getSpotBySlug(slug: string): Promise<SpotWithRoute | null> {
  const { data, error } = await supabase
    .from("route_spots")
    .select(
      "*, official_routes!inner(name, slug, cart_friendly, is_published, areas!inner(name, slug))"
    )
    .eq("slug", slug)
    .eq("official_routes.is_published", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const route = data.official_routes as unknown as {
    name: string;
    slug: string;
    cart_friendly: boolean;
    areas: { name: string; slug: string };
  };
  const parsed = parseSpotLocation(data as Record<string, unknown>);
  return {
    ...parsed,
    slug: data.slug as string,
    route_name: route.name,
    route_slug: route.slug,
    area_name: route.areas.name,
    area_slug: route.areas.slug,
  } as SpotWithRoute;
}

export async function getRoutesBySpotRouteId(
  routeId: string
): Promise<{ name: string; slug: string; area_name: string }[]> {
  const { data, error } = await supabase
    .from("official_routes")
    .select("name, slug, areas!inner(name)")
    .eq("id", routeId)
    .eq("is_published", true);

  if (error || !data) return [];
  return data.map((r) => ({
    name: r.name,
    slug: r.slug,
    area_name: (r.areas as unknown as { name: string }).name,
  }));
}

// SEOランディング対象のスポットの slug のみ返す（インフラ系を除外）。
// generateStaticParams / sitemap で使用。
export async function getAllSpotSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("route_spots")
    .select("slug, official_routes!inner(is_published)")
    .not("slug", "is", null)
    .eq("official_routes.is_published", true)
    .not("category", "in", `(${NON_SEO_CATEGORIES_ARR.join(",")})`);

  if (error) return [];
  return (data ?? []).map((s) => s.slug as string);
}
