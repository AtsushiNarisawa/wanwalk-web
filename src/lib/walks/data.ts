import { wanwalkSupabase as supabase } from "./supabase";
import type { Area, OfficialRoute, RouteSpot, RouteWithArea } from "@/types/walks";

export async function getFeaturedRoute(): Promise<RouteWithArea | null> {
  const { data, error } = await supabase
    .from("featured_routes")
    .select("route_id, label, official_routes(*, areas(id, name, slug, prefecture, description))")
    .eq("is_active", true)
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
    .select("id, name, slug, prefecture, description")
    .not("slug", "is", null)
    .order("prefecture")
    .order("name");

  if (error) return [];
  return data ?? [];
}

export async function getAreaBySlug(slug: string): Promise<Area | null> {
  const { data, error } = await supabase
    .from("areas")
    .select("id, name, slug, prefecture, description")
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
      "id, area_id, name, slug, description, difficulty_level, distance_meters, estimated_minutes, thumbnail_url, pet_info, total_pins, total_walks, is_published, start_location"
    )
    .eq("area_id", areaId)
    .eq("is_published", true)
    .order("name");

  if (error) return [];
  return (data ?? []).map(parseRouteLocation);
}

export async function getAllPublishedRoutes(): Promise<RouteWithArea[]> {
  const { data, error } = await supabase
    .from("official_routes")
    .select(
      "id, area_id, name, slug, description, meta_description, difficulty_level, distance_meters, estimated_minutes, elevation_gain_meters, thumbnail_url, gallery_images, pet_info, total_pins, total_walks, is_published, created_at, updated_at, start_location, areas(id, name, slug, prefecture, description)"
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
      "id, area_id, name, slug, description, meta_description, difficulty_level, distance_meters, estimated_minutes, elevation_gain_meters, thumbnail_url, gallery_images, pet_info, total_pins, total_walks, is_published, created_at, updated_at, start_location, areas(id, name, slug, prefecture, description)"
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

export async function getRouteSpots(routeId: string): Promise<RouteSpot[]> {
  const { data, error } = await supabase
    .from("route_spots")
    .select("*")
    .eq("route_id", routeId)
    .order("spot_order");

  if (error) return [];
  return data ?? [];
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
      "id, name, slug, prefecture, description, hero_image_url, official_routes(count)"
    )
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
      route_count: routes?.[0]?.count ?? 0,
    };
  });
}

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
