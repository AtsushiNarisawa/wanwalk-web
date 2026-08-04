import { describe, it, expect, beforeEach, vi } from "vitest";

// RSC ペイロード漏れ回帰ガード（2026-08-04）。
// 経緯: RouteCard / RouteItinerary / RouteMapWrapper（すべて Client Component）に
// DB の行をまるごと渡していたため、画面に描画しない pet_info / dog_policy /
// opening_hours / price_range / phone / website_url 等が RSC ペイロード（配信HTML）に
// 埋め込まれていた（DBは触らず、渡すデータだけを絞って遮断・完全に可逆）。
//
// 1) クエリ契約テスト: 一覧系の SELECT 列リストから pet_info が外れていること
//    （getRouteBySlug だけはサーバー側で pet_info を使うため残す）。
// 2) 純関数テスト: toItinerarySpot / toMapSpot が dog_policy 等の非表示フィールドを
//    一切含まないオブジェクトを返すこと（値をnull化するのではなくキー自体を含めない）。

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
import type { RouteSpot } from "@/types/walks";

function selectArg(): string {
  const calls = h.state.lastBuilder?.__calls ?? [];
  const sel = calls.find(([m]) => m === "select");
  return String(sel?.[1]?.[0] ?? "");
}

beforeEach(() => h.reset());

describe("一覧系ルートクエリは pet_info を選択しない（RouteCard へ渡るため）", () => {
  it("getAllPublishedRoutes の select に pet_info が含まれない", async () => {
    await data.getAllPublishedRoutes();
    expect(selectArg()).not.toMatch(/\bpet_info\b/);
  });

  it("getRoutesByAreaId の select に pet_info が含まれない", async () => {
    await data.getRoutesByAreaId("area-id");
    expect(selectArg()).not.toMatch(/\bpet_info\b/);
  });

  it("getRelatedRoutes の select に pet_info が含まれない", async () => {
    await data.getRelatedRoutes(
      { id: "x", area_id: "a", season_tags: [], distance_meters: 1000, cart_friendly: true } as never,
      4
    );
    expect(selectArg()).not.toMatch(/\bpet_info\b/);
  });

  it("getRouteBySlug は pet_info を選択する（詳細ページのサーバー側描画に必要・維持）", async () => {
    await data.getRouteBySlug("x");
    expect(selectArg()).toMatch(/\bpet_info\b/);
  });
});

describe("toItinerarySpot / toMapSpot は非表示フィールドを一切含まない", () => {
  const fullSpot: RouteSpot = {
    id: "spot-1",
    route_id: "route-1",
    spot_order: 1,
    spot_type: "waypoint",
    slug: "test-spot",
    name: "テストスポット",
    description: "説明文",
    landscape_feature: "渓谷",
    activity_suggestions: ["撮影"],
    seasonal_notes: { spring: "桜が見頃" },
    facility_type: "park",
    pet_friendly: true,
    opening_hours: "9:00-17:00",
    is_optional: false,
    tips: "内部メモ",
    distance_from_start: 500,
    estimated_time_from_start: 10,
    category: "viewpoint",
    dog_policy: {
      size: "all",
      indoor: true,
      terrace: true,
      leash_required: true,
      carrier_required: false,
      dog_fee: "500円",
      notes: "要ワクチン証明書",
    },
    photo_url: "https://example.com/photo.jpg",
    photo_metadata: { image_position: "top" },
    website_url: "https://example.com",
    phone: "03-1234-5678",
    price_range: "¥¥",
    lat: 35.1,
    lng: 139.1,
  };

  it("toItinerarySpot は dog_policy を含まない（vaccination等の未定義キーが紛れ込んだ場合も対象外）", () => {
    const result = data.toItinerarySpot(fullSpot);
    const keys = Object.keys(result);
    expect(keys).not.toContain("dog_policy");
    expect(keys).not.toContain("opening_hours");
    expect(keys).not.toContain("price_range");
    expect(keys).not.toContain("phone");
    expect(keys).not.toContain("website_url");
    expect(keys).not.toContain("tips");
    expect(keys).not.toContain("pet_friendly");
  });

  it("toItinerarySpot は画面表示に使うフィールドをすべて保持する", () => {
    const result = data.toItinerarySpot(fullSpot);
    expect(result).toEqual({
      id: "spot-1",
      slug: "test-spot",
      name: "テストスポット",
      description: "説明文",
      category: "viewpoint",
      photo_url: "https://example.com/photo.jpg",
      photo_metadata: { image_position: "top" },
      seasonal_notes: { spring: "桜が見頃" },
      distance_from_start: 500,
      spot_order: 1,
      is_optional: false,
    });
  });

  it("toMapSpot は dog_policy 等を含まず、地図描画に使う最小フィールドのみ", () => {
    const result = data.toMapSpot(fullSpot);
    expect(result).toEqual({
      id: "spot-1",
      lat: 35.1,
      lng: 139.1,
      category: "viewpoint",
      name: "テストスポット",
    });
  });

  it("DB側で dog_policy に想定外キー（vaccination_proof_required等）が追加されても伝播しない", () => {
    const spotWithExtraKeys = {
      ...fullSpot,
      dog_policy: {
        ...fullSpot.dog_policy,
        vaccination_proof_required: true,
        registration_required: true,
      },
    } as RouteSpot;
    const itinerary = JSON.stringify(data.toItinerarySpot(spotWithExtraKeys));
    const map = JSON.stringify(data.toMapSpot(spotWithExtraKeys));
    expect(itinerary).not.toMatch(/vaccination_proof_required|registration_required/);
    expect(map).not.toMatch(/vaccination_proof_required|registration_required/);
  });
});
