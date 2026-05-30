import { describe, it, expect, vi } from "vitest";

// W13 getSiteStats の集計ロジック（distinct エリア / 平均ストーリー字数 / スポット head count）を固定。
// react cache() は恒等化、Supabase は table 別に固定データを返すスタブに差し替える。
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));

vi.mock("@/lib/walks/supabase", () => {
  function make(table: string) {
    const b: Record<string, unknown> = {};
    b.select = () => b;
    b.eq = () => b;
    b.then = (resolve: (v: unknown) => void) => {
      if (table === "official_routes") {
        resolve({
          data: [
            { area_id: "a1", description: "x".repeat(100) },
            { area_id: "a1", description: "y".repeat(200) },
            { area_id: "a2", description: "z".repeat(300) },
            { area_id: "a2", description: null }, // 字数集計から除外
            { area_id: null, description: "" }, // area_id null は distinct から除外・字数も除外
          ],
          error: null,
        });
      } else {
        // route_spots head count
        resolve({ data: null, count: 454, error: null });
      }
    };
    return b;
  }
  return { wanwalkSupabase: { from: (t: string) => make(t) } };
});

import { getSiteStats } from "@/lib/walks/stats";

describe("getSiteStats (W13)", () => {
  it("ルート数 / 対応エリア数 / スポット数 / 平均ストーリー字数を集計", async () => {
    const s = await getSiteStats();
    expect(s.routeCount).toBe(5); // 公開ルート行数
    expect(s.areaCount).toBe(2); // distinct な非 null area_id: a1, a2
    expect(s.spotCount).toBe(454); // head count
    expect(s.avgStoryLength).toBe(200); // (100+200+300)/3、空/ null は除外
  });
});
