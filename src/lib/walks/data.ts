import { wanwalkSupabase as supabase } from "./supabase";
import type { Area, OfficialRoute, RouteSpot, RouteWithArea, SpotWithRoute } from "@/types/walks";

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
      "id, area_id, name, slug, description, difficulty_level, distance_meters, estimated_minutes, thumbnail_url, pet_info, total_pins, total_walks, is_published, cart_friendly, start_location"
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
      "id, area_id, name, slug, description, meta_description, difficulty_level, distance_meters, estimated_minutes, elevation_gain_meters, thumbnail_url, gallery_images, pet_info, total_pins, total_walks, is_published, cart_friendly, created_at, updated_at, start_location, areas(id, name, slug, prefecture, description)"
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
      "id, area_id, name, slug, description, meta_description, difficulty_level, distance_meters, estimated_minutes, elevation_gain_meters, thumbnail_url, gallery_images, pet_info, total_pins, total_walks, is_published, cart_friendly, created_at, updated_at, start_location, areas(id, name, slug, prefecture, description)"
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
  return (data ?? []).map((s) => {
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
      "*, official_routes!inner(name, slug, areas!inner(name, slug))"
    )
    .not("slug", "is", null)
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

export async function getSpotBySlug(slug: string): Promise<SpotWithRoute | null> {
  const { data, error } = await supabase
    .from("route_spots")
    .select(
      "*, official_routes!inner(name, slug, cart_friendly, areas!inner(name, slug))"
    )
    .eq("slug", slug)
    .limit(1)
    .single();

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

export async function getAllSpotSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("route_spots")
    .select("slug")
    .not("slug", "is", null);

  if (error) return [];
  return (data ?? []).map((s) => s.slug as string);
}
