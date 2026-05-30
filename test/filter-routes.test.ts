import { describe, it, expect } from "vitest";
import {
  parseSeasonParam,
  parseCartParam,
  filterRoutes,
} from "@/lib/walks/filter-routes";
import type { OfficialRoute } from "@/types/walks";

// 季節フィルタは W4 で SSoT を season_tags に統一済み。fail-closed（タグ未設定は除外）が
// 崩れると非対応季節のルートが混入するため、ここで退行を固定する。

describe("parseSeasonParam", () => {
  it("有効な4季節はそのまま返す", () => {
    for (const s of ["spring", "summer", "autumn", "winter"]) {
      expect(parseSeasonParam(s)).toBe(s);
    }
  });
  it("無効値・undefined・空文字は null", () => {
    expect(parseSeasonParam("fall")).toBeNull();
    expect(parseSeasonParam("Spring")).toBeNull();
    expect(parseSeasonParam(undefined)).toBeNull();
    expect(parseSeasonParam("")).toBeNull();
  });
});

describe("parseCartParam", () => {
  it("'1' / 'true' は true", () => {
    expect(parseCartParam("1")).toBe(true);
    expect(parseCartParam("true")).toBe(true);
  });
  it("それ以外は false", () => {
    expect(parseCartParam("0")).toBe(false);
    expect(parseCartParam("yes")).toBe(false);
    expect(parseCartParam(undefined)).toBe(false);
  });
});

describe("filterRoutes", () => {
  const routes = [
    { id: "a", season_tags: ["spring", "summer"], cart_friendly: true },
    { id: "b", season_tags: ["winter"], cart_friendly: false },
    { id: "c", season_tags: [], cart_friendly: true }, // fail-closed で季節フィルタから除外
    { id: "d", season_tags: null, cart_friendly: true }, // 同上（null）
  ] as unknown as OfficialRoute[];

  it("フィルタ無しは全件", () => {
    expect(filterRoutes(routes, null, false)).toHaveLength(4);
  });
  it("季節は base season に一致するもののみ", () => {
    expect(filterRoutes(routes, "spring", false).map((r) => r.id)).toEqual(["a"]);
    expect(filterRoutes(routes, "winter", false).map((r) => r.id)).toEqual(["b"]);
  });
  it("fail-closed: season_tags が空/null のルートは季節フィルタで除外", () => {
    expect(filterRoutes(routes, "summer", false).map((r) => r.id)).toEqual(["a"]);
  });
  it("cartOnly は cart_friendly===true のみ", () => {
    expect(filterRoutes(routes, null, true).map((r) => r.id)).toEqual(["a", "c", "d"]);
  });
  it("季節 + カートの複合", () => {
    expect(filterRoutes(routes, "spring", true).map((r) => r.id)).toEqual(["a"]);
  });
});
