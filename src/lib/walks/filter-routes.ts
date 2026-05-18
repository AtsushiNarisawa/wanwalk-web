import type { OfficialRoute, RouteWithArea, Season } from "@/types/walks";

const VALID_SEASONS: readonly Season[] = ["spring", "summer", "autumn", "winter"];

export function parseSeasonParam(value: string | undefined): Season | null {
  if (!value) return null;
  return (VALID_SEASONS as readonly string[]).includes(value)
    ? (value as Season)
    : null;
}

export function parseCartParam(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export function filterRoutes<T extends OfficialRoute | RouteWithArea>(
  routes: T[],
  season: Season | null,
  cartOnly: boolean,
): T[] {
  let result = routes;
  if (season) {
    result = result.filter((r) => {
      const tags = r.pet_info?.best_season_tags;
      if (!tags || !Array.isArray(tags)) return true;
      return tags.includes(season);
    });
  }
  if (cartOnly) {
    result = result.filter((r) => r.cart_friendly === true);
  }
  return result;
}
