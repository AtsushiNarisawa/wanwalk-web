import { describe, it, expect } from "vitest";
import {
  hasPriceWord,
  sanitizeText,
  sanitizeList,
  sanitizeParking,
  buildRoutePositionText,
  buildSpotMetaDescription,
} from "@/lib/walks/spot-page-content";
import { formatSpotDistance, formatDistance } from "@/lib/walks/format";

// /spots/{slug} の固有コンテンツ化（2026-09-03）で新たに描画へ回した列
// （landscape_feature / activity_suggestions / pet_info->>'parking'）の
// 掲載禁止事項ガードを固定する。ここが緩むと料金語が公開HTMLに出る。

describe("hasPriceWord", () => {
  it("料金の別を示す語を検出する", () => {
    for (const s of [
      "広大な無料ドッグラン",
      "あり（ポーラ美術館駐車場・有料）",
      "料金は現地で",
      "入場料あり",
      "拝観料が必要",
      "駐車料あり",
      "500円",
      "1,200円",
      "３００円",
    ]) {
      expect(hasPriceWord(s), s).toBe(true);
    }
  });

  it("料金の話でない「円」は誤検出しない（実データ）", () => {
    // route_spots の実データ。ここを弾くと正当なコンテンツが消える。
    expect(hasPriceWord("円覚寺の山門と緑")).toBe(false);
    expect(hasPriceWord("千円札と同じ構図で撮影")).toBe(false);
    expect(hasPriceWord("砂浜")).toBe(false);
    expect(hasPriceWord(null)).toBe(false);
    expect(hasPriceWord(undefined)).toBe(false);
  });
});

describe("sanitizeText / sanitizeList", () => {
  it("料金語を含む値は丸ごと落とす（部分削除で不完全な文にしない）", () => {
    expect(sanitizeText("広大な無料ドッグラン")).toBeNull();
    expect(sanitizeText("砂浜")).toBe("砂浜");
    expect(sanitizeText("  ")).toBeNull();
  });

  it("配列は要素単位で濾す", () => {
    expect(sanitizeList(["愛犬と水遊び", "入場料は現地で", "砂浜で記念撮影"])).toEqual([
      "愛犬と水遊び",
      "砂浜で記念撮影",
    ]);
    expect(sanitizeList(null)).toEqual([]);
  });
});

describe("sanitizeParking", () => {
  it("料金語を含む駐車場欄は落とす", () => {
    expect(sanitizeParking("あり（◯◯駐車場・無料）", "some-route")).toBeNull();
  });

  it("台数など料金でない詳細は通す", () => {
    expect(sanitizeParking("あり（県営本栖湖駐車場・約100台）", "kawaguchiko-motosuko-fuji-view")).toBe(
      "あり（県営本栖湖駐車場・約100台）"
    );
  });

  it("ポーラ美術館のルートだけは既存文言のまま通す（CEO 明示の例外）", () => {
    expect(
      sanitizeParking("あり（ポーラ美術館駐車場・有料）", "hakone-sengokuhara-pola-museum-trail")
    ).toBe("あり（ポーラ美術館駐車場・有料）");
  });

  it("空値は null", () => {
    expect(sanitizeParking(null, "x")).toBeNull();
    expect(sanitizeParking("", "x")).toBeNull();
  });
});

describe("buildRoutePositionText", () => {
  const fmt = { formatSpotDistance, formatDistance };

  it("起点からの距離・総距離・所要時間を1行にまとめる", () => {
    expect(
      buildRoutePositionText({
        distanceFromStart: 1172,
        routeDistanceMeters: "3725.00",
        estimatedMinutes: 50,
        ...fmt,
      })
    ).toBe("このルートの起点から1.2km地点です（全体3.7km・所要約50分）。");
  });

  it("1km 未満は整数 m（DESIGN_TOKENS §9 の区間距離）", () => {
    expect(
      buildRoutePositionText({
        distanceFromStart: 605,
        routeDistanceMeters: 4145,
        estimatedMinutes: 83,
        ...fmt,
      })
    ).toBe("このルートの起点から605m地点です（全体4.1km・所要約83分）。");
  });

  it("0m は「起点にあたります」", () => {
    expect(
      buildRoutePositionText({
        distanceFromStart: 0,
        routeDistanceMeters: 3725,
        estimatedMinutes: null,
        ...fmt,
      })
    ).toBe("このルートの起点にあたります（全体3.7km）。");
  });

  it("distance_from_start が無ければ行ごと出さない", () => {
    expect(
      buildRoutePositionText({
        distanceFromStart: null,
        routeDistanceMeters: 3725,
        estimatedMinutes: 50,
        ...fmt,
      })
    ).toBeNull();
  });
});

describe("buildSpotMetaDescription", () => {
  it("先頭で「そこが何か」と「愛犬と歩けるか」に答える", () => {
    const d = buildSpotMetaDescription({
      name: "本栖湖 湖畔の砂浜",
      areaName: "河口湖・山中湖",
      categoryLabel: "景観ポイント",
      petFriendly: true,
      bodyText: "本栖湖南岸の砂浜エリア。透明度が高い。",
      landscapeFeature: "砂浜",
      activitySuggestions: ["愛犬と水遊び", "砂浜で記念撮影"],
      routeName: "本栖湖 静寂の湖畔散歩 富士山ビュー",
      hasParking: true,
    });
    expect(d.startsWith("河口湖・山中湖の景観ポイント「本栖湖 湖畔の砂浜」。愛犬と一緒に立ち寄れます。")).toBe(true);
    expect(d).toContain("見どころは砂浜。");
    expect(d).toContain("愛犬と水遊び・砂浜で記念撮影ができます。");
    expect(d.length).toBeLessThanOrEqual(140);
  });

  it("文の途中で切らない（必ず句点で終わる）", () => {
    const d = buildSpotMetaDescription({
      name: "多摩川河川敷ドッグラン（狛江）",
      areaName: "多摩川",
      categoryLabel: "ドッグラン",
      petFriendly: true,
      bodyText: "多摩川河川敷の多摩水道橋たもとに整備された、狛江市が管理する公共ドッグラン。フェンスで囲まれた地面は抜けが良い。",
      landscapeFeature: "広大な無料ドッグラン",
      activitySuggestions: ["ドッグランで遊ぶ", "犬友と交流"],
      routeName: "多摩川河川敷サイクリングロード散歩",
      hasParking: true,
    });
    expect(d.endsWith("。")).toBe(true);
    // 料金語を含む landscape_feature は素材から落ちる
    expect(d).not.toContain("無料");
  });

  it("pet_friendly=false でも否定の断定はしない（同伴条件は載せない）", () => {
    const d = buildSpotMetaDescription({
      name: "長谷寺 門前",
      areaName: "鎌倉",
      categoryLabel: "景観ポイント",
      petFriendly: false,
      bodyText: "観音山の中腹に立つ長谷寺の門前エリア。",
      landscapeFeature: "長谷寺の山門と参道",
      activitySuggestions: ["門前から参拝", "参道の花を楽しむ"],
      routeName: "長谷寺・大仏コース",
      hasParking: true,
    });
    expect(d).not.toContain("入れません");
    expect(d).not.toContain("ペット不可");
    expect(d).not.toContain("愛犬と一緒に立ち寄れます");
    expect(d).toContain("見どころは長谷寺の山門と参道。");
  });

  it("固有素材が無いスポットでも本文の先頭1文で埋まる", () => {
    const d = buildSpotMetaDescription({
      name: "芦ノ湖畔遊歩道",
      areaName: "箱根・仙石原",
      categoryLabel: "景観ポイント",
      petFriendly: true,
      bodyText: "芦ノ湖の湖畔に沿って続く遊歩道。桃源台から湖尻へ抜ける区間は平坦で歩きやすい。",
      landscapeFeature: null,
      activitySuggestions: null,
      routeName: "芦ノ湖 湖畔さんぽ",
      hasParking: true,
    });
    expect(d).toContain("芦ノ湖畔遊歩道");
    expect(d.endsWith("。")).toBe(true);
    expect(d.length).toBeGreaterThan(40);
  });

  it("meta に料金語を出さない", () => {
    const d = buildSpotMetaDescription({
      name: "ポーラ美術館 森の遊歩道",
      areaName: "箱根・仙石原",
      categoryLabel: "景観ポイント",
      petFriendly: true,
      bodyText: "ブナやヒメシャラの自然林を抜ける遊歩道。",
      landscapeFeature: "自然林の遊歩道",
      activitySuggestions: ["森林浴", "彫刻を眺める"],
      routeName: "ポーラ美術館 森の遊歩道コース",
      // 駐車場は「あり」の事実だけ。台数・料金は meta に出さない。
      hasParking: true,
    });
    expect(hasPriceWord(d)).toBe(false);
    expect(d).toContain("駐車場あり。");
  });
});
