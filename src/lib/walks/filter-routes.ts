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
      // 旧 pet_info.best_season_tags は season_tags と 55/74 本で不整合のため使わない
      //（2026-09-24 再測でも 55/74 で変化なし。うち 51 本は best_season_tags 側が
      //  季節を余分に持つ＝系統的に過大なので、穴埋めの供給源としても信用しない）。
      // season_tags には base season(spring/summer/autumn/winter) と feature タグが混在するが、
      // season は base のみなので includes で base 一致だけ拾える。
      const tags = r.season_tags;
      // fail-closed: base season を1つも持たないルートは、春夏秋冬どの季節フィルタにも出ない。
      // ⚠️ 欠落は「起こりうる」前提で扱うこと。充足済みと決めつけない。
      //   2026-09-24 実測: 公開 93 本中 16 本が base 欠落＝全季節フィルタから消えていた。
      //   うち 13 本を pet_info.best_season の本文から機械規則で補填し、残 3 本は
      //   本文が「通年」表記のみで機械的に決められず CEO 判断待ち（欠落のまま）。
      //   新規ルート追加・タグ編集のたびに再発しうるので、下記 SQL で残数を定期確認する:
      //     SELECT slug FROM official_routes WHERE is_published = true
      //       AND NOT (season_tags && ARRAY['spring','summer','autumn','winter']);
      if (!tags || !Array.isArray(tags) || tags.length === 0) return false;
      return tags.includes(season);
    });
  }
  if (cartOnly) {
    result = result.filter((r) => r.cart_friendly === true);
  }
  return result;
}
