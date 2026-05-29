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
      // SSoT は official_routes.season_tags（B-2 タグ化）。
      // 旧 pet_info.best_season_tags は season_tags と 55/74 本で不整合のため使わない。
      // season_tags には base season(spring/summer/autumn/winter) と feature タグが混在するが、
      // season は base のみなので includes で base 一致だけ拾える。
      const tags = r.season_tags;
      // fail-closed: 季節タグ未設定ルートは特定季節フィルタから除外する。
      // 全公開ルートは season_tags 充足済（欠落 0 を SQL 確認）。新規ルートの入れ忘れ時のみ作用。
      if (!tags || !Array.isArray(tags) || tags.length === 0) return false;
      return tags.includes(season);
    });
  }
  if (cartOnly) {
    result = result.filter((r) => r.cart_friendly === true);
  }
  return result;
}
