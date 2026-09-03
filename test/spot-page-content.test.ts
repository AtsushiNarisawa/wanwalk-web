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
    expect(d).toContain("過ごし方は、愛犬と水遊び・砂浜で記念撮影など。");
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

  // 2026-09-03 Preview 実測で発覚した文法バグの退行テスト。
  // activity_suggestions には名詞止めと動詞止めが混在しており、旧実装の
  // 「${items}ができます。」は動詞止めで「東京湾を眺めるができます」と壊れていた。
  describe("activity_suggestions の語尾（名詞止め・動詞止めの両方で自然な日本語になる）", () => {
    const base = {
      name: "潮風公園",
      areaName: "お台場・豊洲",
      categoryLabel: "公園・自然",
      petFriendly: true,
      bodyText: "東京湾に面した細長い公園。",
      landscapeFeature: "芝生広場と東京湾",
      routeName: "お台場海浜公園コース",
      hasParking: true,
    };

    it("動詞で終わる項目（実データ /spots/shiokaze-koen）", () => {
      const d = buildSpotMetaDescription({
        ...base,
        activitySuggestions: ["芝生で休憩", "東京湾を眺める"],
      });
      expect(d).toContain("過ごし方は、芝生で休憩・東京湾を眺めるなど。");
      expect(d).not.toContain("眺めるができます");
      expect(d).not.toContain("ができます");
    });

    it("動詞で終わる項目（実データ /spots/hasedera-monzen）", () => {
      const d = buildSpotMetaDescription({
        ...base,
        name: "長谷寺 門前",
        areaName: "鎌倉",
        petFriendly: false,
        landscapeFeature: "長谷寺の山門と参道",
        activitySuggestions: ["門前から参拝", "参道の花を楽しむ"],
      });
      expect(d).toContain("過ごし方は、門前から参拝・参道の花を楽しむなど。");
      expect(d).not.toContain("楽しむができます");
      expect(d).not.toContain("ができます");
    });

    it("名詞で終わる項目（実データ /spots/kohan-no-sunahama）", () => {
      const d = buildSpotMetaDescription({
        ...base,
        name: "本栖湖 湖畔の砂浜",
        areaName: "河口湖・山中湖",
        landscapeFeature: "砂浜",
        activitySuggestions: ["愛犬と水遊び", "砂浜で記念撮影"],
      });
      expect(d).toContain("過ごし方は、愛犬と水遊び・砂浜で記念撮影など。");
      expect(d).not.toContain("ができます");
    });

    it("名詞止めと動詞止めが混在しても壊れない", () => {
      const d = buildSpotMetaDescription({
        ...base,
        activitySuggestions: ["砂浜で記念撮影", "東京湾を眺める"],
      });
      expect(d).toContain("過ごし方は、砂浜で記念撮影・東京湾を眺めるなど。");
      expect(d.endsWith("。")).toBe(true);
    });

    it("1件だけでも自然（区切り文字が浮かない）", () => {
      const d = buildSpotMetaDescription({
        ...base,
        activitySuggestions: ["東京湾を眺める"],
      });
      expect(d).toContain("過ごし方は、東京湾を眺めるなど。");
      expect(d).not.toContain("・など");
    });
  });

  // spot_page_body 起点の meta（2026-09-03 本番実測で追加）。
  // /spots/hasedera-monzen は「長谷寺 犬連れ」で212表示0クリック。本文の第2・第3文こそが
  // 検索者の問いへの答えなのに、テンプレを並べたあと第1文だけ足して終わっていた。
  describe("spot_page_body があるときは本文の冒頭から文単位で作る", () => {
    // 実データ（route_spots.spot_page_body）の冒頭。
    const hasederaBody =
      "鎌倉・長谷寺の門前エリアです。はじめにお伝えすると、長谷寺の境内へは愛犬と一緒に入ることができません。" +
      "愛犬と過ごせるのは山門の手前まで、門前の参道の区間になります。" +
      "観音山の中腹に立つ長谷寺は、高さ約9.18mの十一面観音菩薩立像で知られ、境内は本堂から見晴台まで段差のある立体的なつくりです。";

    const base = {
      name: "長谷寺 門前",
      areaName: "鎌倉",
      categoryLabel: "景観ポイント",
      petFriendly: false,
      bodyText: "観音山の中腹に立ち、十一面観音菩薩立像で名高い長谷寺の門前エリア。",
      landscapeFeature: "長谷寺の山門と参道",
      activitySuggestions: ["門前から参拝", "参道の花を楽しむ"],
      routeName: "長谷寺・大仏コース",
      hasParking: true,
    };

    it("テンプレを挟まず、検索者の問いへの答え（第2・第3文）が meta に載る", () => {
      const d = buildSpotMetaDescription({ ...base, spotPageBody: hasederaBody });
      expect(d.startsWith("鎌倉・長谷寺の門前エリアです。")).toBe(true);
      expect(d).toContain("長谷寺の境内へは愛犬と一緒に入ることができません。");
      expect(d).toContain("愛犬と過ごせるのは山門の手前まで、門前の参道の区間になります。");
      // テンプレの断片は混ざらない
      expect(d).not.toContain("見どころは");
      expect(d).not.toContain("過ごし方は、");
      expect(d).not.toContain("の途中にあります");
      expect(d).not.toContain("景観ポイント「長谷寺 門前」");
    });

    it("文の途中で切れず、110字前後（駐車場込みで120字以内）に収まる", () => {
      const d = buildSpotMetaDescription({ ...base, spotPageBody: hasederaBody });
      expect(d.endsWith("。")).toBe(true);
      expect(d.length).toBeLessThanOrEqual(120);
      // 上限を超える第4文は入らない
      expect(d).not.toContain("観音山の中腹に立つ長谷寺は");
    });

    it("余裕があれば末尾に「駐車場あり。」を足す／120字を超えるなら足さない", () => {
      const withP = buildSpotMetaDescription({ ...base, spotPageBody: hasederaBody });
      expect(withP.endsWith("駐車場あり。")).toBe(true);

      const noP = buildSpotMetaDescription({
        ...base,
        spotPageBody: hasederaBody,
        hasParking: false,
      });
      expect(noP.endsWith("駐車場あり。")).toBe(false);
      expect(noP.endsWith("。")).toBe(true);

      // 詰めた結果が 115字なら「駐車場あり。」(6字) を足すと 121字＝足さない
      const long = "あ".repeat(114) + "。";
      const d = buildSpotMetaDescription({ ...base, spotPageBody: long, hasParking: true });
      expect(d.length).toBe(115);
      expect(d).not.toContain("駐車場あり。");
    });

    it("1文が110字を超える body は、その1文だけを返し途中で切らない", () => {
      const oneLongSentence = "あ".repeat(180) + "。";
      const d = buildSpotMetaDescription({
        ...base,
        spotPageBody: oneLongSentence,
        hasParking: true,
      });
      expect(d).toBe(oneLongSentence); // 181字。切らない・駐車場も足さない
      expect(d.endsWith("。")).toBe(true);
      expect(d.length).toBe(181);
    });

    it("body が NULL のときは従来のテンプレ生成に落ちる", () => {
      const d = buildSpotMetaDescription({ ...base, spotPageBody: null });
      expect(d.startsWith("鎌倉の景観ポイント「長谷寺 門前」。")).toBe(true);
      expect(d).toContain("見どころは長谷寺の山門と参道。");
      expect(d).toContain("過ごし方は、門前から参拝・参道の花を楽しむなど。");

      // 空文字・空白のみも NULL と同じ扱い
      expect(buildSpotMetaDescription({ ...base, spotPageBody: "" })).toBe(d);
      expect(buildSpotMetaDescription({ ...base, spotPageBody: "   " })).toBe(d);
      expect(buildSpotMetaDescription({ ...base })).toBe(d);
    });

    it("料金語を含む文は飛ばす（将来の混入に備えた防御・現状の実データは0件）", () => {
      const d = buildSpotMetaDescription({
        ...base,
        spotPageBody: "湖畔の砂浜です。駐車場は有料です。愛犬と水際で過ごせます。",
        hasParking: false,
      });
      expect(d).toBe("湖畔の砂浜です。愛犬と水際で過ごせます。");
      expect(hasPriceWord(d)).toBe(false);
    });
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
