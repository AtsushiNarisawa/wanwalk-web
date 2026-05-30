import { describe, it, expect, beforeEach, vi } from "vitest";

// W1/W9 回帰ガード: data.ts の各取得関数が親ルート（または自身）の is_published フィルタを
// 必ず付与していることを「クエリ契約」として検証する。Supabase クライアントを記録用に差し替え、
// .eq('is_published', true) / .eq('official_routes.is_published', true) の呼び出し有無を見る。
// 過去、これらの一部に is_published が欠落し非公開コンテンツが Web 露出した（14スポット漏洩）。

// react の cache() は request scope 前提なので、テストでは恒等関数に差し替えて素通しにする。
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));

const h = vi.hoisted(() => {
  const state: { lastBuilder: { __calls: [string, unknown[]][] } | null } = {
    lastBuilder: null,
  };
  const methods = [
    "select",
    "eq",
    "neq",
    "not",
    "in",
    "is",
    "order",
    "limit",
    "maybeSingle",
    "single",
  ];
  function builder() {
    const calls: [string, unknown[]][] = [];
    const b: Record<string, unknown> & { __calls: [string, unknown[]][] } = {
      __calls: calls,
    } as never;
    for (const m of methods) {
      (b as Record<string, unknown>)[m] = (...args: unknown[]) => {
        calls.push([m, args]);
        return b;
      };
    }
    // thenable: await でクエリ結果を返す。終端メソッドに応じて data 形を変える:
    //   .single()      → 空オブジェクト（getRouteBySlug は error のみガードなので map される）
    //   .maybeSingle() → null（getSpotBySlug は !data ガードで早期 null 返却）
    //   それ以外（list）→ 空配列
    (b as Record<string, unknown>).then = (resolve: (v: unknown) => void) => {
      const used = (m: string) => calls.some(([c]) => c === m);
      const data = used("single") ? {} : used("maybeSingle") ? null : [];
      resolve({ data, error: null, count: 0 });
    };
    return b;
  }
  return {
    state,
    reset() {
      state.lastBuilder = null;
    },
    supa: {
      from: () => {
        const b = builder();
        state.lastBuilder = b;
        return b;
      },
    },
  };
});

vi.mock("@/lib/walks/supabase", () => ({ wanwalkSupabase: h.supa }));

import * as data from "@/lib/walks/data";

function hasEq(col: string, val: unknown): boolean {
  const calls = h.state.lastBuilder?.__calls ?? [];
  return calls.some(([m, a]) => m === "eq" && a[0] === col && a[1] === val);
}

beforeEach(() => h.reset());

describe("data.ts is_published filtering (W1/W9 回帰ガード)", () => {
  it("getSpotBySlug は親ルート is_published を絞る", async () => {
    await data.getSpotBySlug("x");
    expect(hasEq("official_routes.is_published", true)).toBe(true);
  });

  it("getAllSpotSlugs は親ルート is_published を絞る", async () => {
    await data.getAllSpotSlugs();
    expect(hasEq("official_routes.is_published", true)).toBe(true);
  });

  it("getAllSpots は親ルート is_published を絞る", async () => {
    await data.getAllSpots();
    expect(hasEq("official_routes.is_published", true)).toBe(true);
  });

  it("getRouteBySlug は is_published を絞る", async () => {
    await data.getRouteBySlug("x");
    expect(hasEq("is_published", true)).toBe(true);
  });

  it("getAllPublishedRoutes は is_published を絞る", async () => {
    await data.getAllPublishedRoutes();
    expect(hasEq("is_published", true)).toBe(true);
  });

  it("getFeaturedRoute は親ルート is_published を絞る", async () => {
    await data.getFeaturedRoute();
    expect(hasEq("official_routes.is_published", true)).toBe(true);
  });

  it("getRoutesBySpotRouteId は is_published を絞る", async () => {
    await data.getRoutesBySpotRouteId("rid");
    expect(hasEq("is_published", true)).toBe(true);
  });
});
