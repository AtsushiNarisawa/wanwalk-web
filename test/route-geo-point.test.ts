import { describe, it, expect } from "vitest";
import { parseGeoPoint } from "@/lib/walks/data";

// 回帰ガード（2026-08-30）:
// PostgREST が official_routes.start_location を返す実際の形式は EWKB の16進文字列。
// 旧実装は WKT 文字列 / GeoJSON オブジェクトしか見ておらず、全ルートで
// start_lat / start_lng が 0 に落ち、ルート詳細の Googleマップ埋め込み（C5）と
// JSON-LD の geo が一度も出力されていなかった。
//
// 🔴 EWKB は X（経度）が先・Y（緯度）が後。取り違えると日本のルートが海を指す。
//    下の fixture は Supabase 本番の実測値（st_x / st_y と生の EWKB）をそのまま貼っている。

const FIXTURES: { slug: string; lat: number; lng: number; ewkb: string }[] = [
  { slug: "atami-seaside-walk", lat: 35.0958, lng: 139.0758, ewkb: "0101000020E61000002D211FF46C626140787AA52C438C4140" },
  { slug: "boso-nokogiriyama", lat: 35.15811, lng: 139.829981, ewkb: "0101000020E6100000A56950348F7A6140D595CFF23C944140" },
  { slug: "boso-tateyama", lat: 34.9897656, lng: 139.8547252, ewkb: "0101000020E610000025A2A9E8597B6140585AA1A3B07E4140" },
  { slug: "chichibu-hitsujiyama-shibazakura", lat: 35.9876062, lng: 139.0896104, ewkb: "0101000020E6100000352CA116DE626140D62945E169FE4140" },
  { slug: "chichibu-minoyama-park-loop", lat: 36.05486, lng: 139.114656, ewkb: "0101000020E610000049490F43AB636140E5ED08A705074240" },
  { slug: "chichibu-muse-park", lat: 35.9952, lng: 139.0554, ewkb: "0101000020E6100000598638D6C5616140567DAEB662FF4140" },
  { slug: "chichibu-nagatoro-iwadatami", lat: 36.0949, lng: 139.1157, ewkb: "0101000020E6100000B6847CD0B3636140F931E6AE250C4240" },
  { slug: "enoshima-iwaya-chigogafuchi", lat: 35.304, lng: 139.482, ewkb: "0101000020E61000008195438B6C6F6140F4FDD478E9A64140" },
  { slug: "hakone-ashinoko-kojiri-walk", lat: 35.23803, lng: 138.9947355, ewkb: "0101000020E610000072158BDFD45F6140C1BB5CC4779E4140" },
  { slug: "hakone-ashinoko-lakeside-walk", lat: 35.2009306, lng: 139.0305263, ewkb: "0101000020E61000005F854A12FA60614001E20918B8994140" },
];

describe("parseGeoPoint / EWKB16進文字列（PostgREST の実応答）", () => {
  for (const f of FIXTURES) {
    it(`${f.slug} の座標が DB 実測値と一致する`, () => {
      const p = parseGeoPoint(f.ewkb);
      expect(p).not.toBeNull();
      expect(p!.lat).toBeCloseTo(f.lat, 7);
      expect(p!.lng).toBeCloseTo(f.lng, 7);
    });
  }

  it("緯度と経度が入れ替わっていない（日本国内の範囲に収まる）", () => {
    for (const f of FIXTURES) {
      const p = parseGeoPoint(f.ewkb)!;
      expect(p.lat).toBeGreaterThan(24);
      expect(p.lat).toBeLessThan(46);
      expect(p.lng).toBeGreaterThan(123);
      expect(p.lng).toBeLessThan(146);
    }
  });
});

describe("parseGeoPoint / 既存形式の維持", () => {
  it("WKT 文字列", () => {
    expect(parseGeoPoint("POINT(139.0758 35.0958)")).toEqual({ lat: 35.0958, lng: 139.0758 });
  });
  it("EWKT 文字列（SRID 付き）", () => {
    expect(parseGeoPoint("SRID=4326;POINT(139.0758 35.0958)")).toEqual({ lat: 35.0958, lng: 139.0758 });
  });
  it("GeoJSON オブジェクト（coordinates は [lng, lat]）", () => {
    expect(parseGeoPoint({ type: "Point", coordinates: [139.0758, 35.0958] })).toEqual({
      lat: 35.0958,
      lng: 139.0758,
    });
  });
});

describe("parseGeoPoint / 解釈できない入力は null", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["空文字", ""],
    ["16進でない文字列", "not-a-geometry"],
    ["短すぎる16進", "0101000020E6100000"],
    ["奇数桁の16進", "0101000020E61000002D211FF46C626140787AA52C438C414"],
    ["coordinates を持たないオブジェクト", { type: "Point" }],
  ])("%s", (_label, value) => {
    expect(parseGeoPoint(value)).toBeNull();
  });

  it("Point 以外のジオメトリ（LineString）は null", () => {
    // 型 = 0x20000002（SRID 付き LineString）
    expect(parseGeoPoint("0102000020E61000002D211FF46C626140787AA52C438C4140")).toBeNull();
  });
});
