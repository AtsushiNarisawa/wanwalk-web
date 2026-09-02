import type { RouteSpot, RouteWithArea } from "@/types/walks";

/**
 * 「〇〇 駐車場」クエリ対応の共通ロジック（2026-09-02）。
 *
 * 背景: GSC 2026-06-01〜08-31 で「〇〇 駐車場」系クエリが 1,892 表示・1 クリック。
 * 駐車場スポットは spot_type='start'/'end' で単体ページを持たないため、
 * 表示はすべてルート詳細ページに落ちている。ここで「地名 × 駐車場」の問いに
 * 質問文・回答文・可視セクションの3箇所で噛み合わせる。
 *
 * ⚠️ 料金・金額は一切書かない（「無料」「有料」の別も書かない）。
 *    台数も新たに書き足さない。DB（pet_info.parking）の値をそのまま通すだけ。
 */

/** 末尾の句点重複を防ぐ。DB値は末尾「。」ありなしが混在しており、
 *  そのまま `${value}。` と連結すると「…（70台）。。」になる（2026-09-02 修正）。 */
export function endWithPeriod(text: string | null | undefined): string {
  const trimmed = (text ?? "").trim().replace(/[。．.、,]+$/u, "");
  return trimmed ? `${trimmed}。` : "";
}

/** 末尾の句点だけ落とす（「…です。」等に続けて連結する用）。 */
export function stripTrailingPeriod(text: string | null | undefined): string {
  return (text ?? "").trim().replace(/[。．.、,]+$/u, "");
}

/**
 * 駐車場クエリ用の地名。route.name は「地名 詩的な説明」形式が多いため、
 * generateMetadata の TITLE_SHORTEN_SLUGS と同じ作法で先頭トークンを取り出す。
 * 空白の無い名前（「山下公園散歩コース」等）はフルネームにフォールバックする。
 * route.name（h1・パンくず・title・他のFAQ）は変更しない。
 */
const PARKING_PLACE_OVERRIDES: Record<string, string> = {
  // 先頭トークンが広域地名になり、実際に検索されている地点名が落ちる6本だけ明示上書き。
  // 上書き文字列はいずれも route.name の中の語で、新しい呼称は作っていない。
  // 括弧内は GSC 2026-06-01〜08-31 の表示回数。
  "nasukogen-otome-falls-forest-walk": "乙女の滝", // 板室温泉 →（乙女の滝 駐車場 88）
  "nasu-minamigaoka-ranch": "南ヶ丘牧場", // 那須 →（南ヶ丘牧場 駐車場 42）※TITLE_OVERRIDES と同じ扱い
  "nikko-shinkyo-kanmangafuchi": "神橋・憾満ヶ淵", // 日光 →（憾満ヶ淵 駐車場 51）
  "chichibu-nagatoro-iwadatami": "長瀞岩畳", // 長瀞 →（長瀞岩畳 102 / 長瀞渓谷 82）
  "hayama-manase-shibazaki": "真名瀬海岸・芝崎海岸", // 葉山 →（芝崎海岸 駐車場 23）
  "tokyo-todoroki-valley-walk": "等々力渓谷", // 「等々力渓谷から多摩川台公園に…」が不自然なため
};

export function routePlaceName(route: Pick<RouteWithArea, "slug" | "name">): string {
  const override = PARKING_PLACE_OVERRIDES[route.slug];
  if (override) return override;
  const head = route.name.split(" ")[0]?.trim() ?? "";
  // 先頭トークンが取り出せない / 極端に短い場合はフルネームへフォールバック
  return head.length >= 2 ? head : route.name;
}

/** スポット名末尾の進行方向ラベル（（ゴール）/ スタート / 帰着）を落として実体名にそろえる。 */
function parkingBaseName(name: string): string {
  return name.replace(/[（(]?\s*(ゴール|スタート|帰着)\s*[)）]?\s*$/u, "").trim();
}

/** 周回判定用の照合キー。「由比ガ浜地下駐車場」と「由比ガ浜 地下駐車場」のような
 *  空白の揺れで別地点と誤判定しないよう、空白を落としてから比較する。 */
function parkingCompareKey(name: string): string {
  return parkingBaseName(name).replace(/[\s　]/gu, "");
}

/** 駐車場そのものを指す名前か（「中目黒駅」のような発着点マーカーと区別する）。 */
function looksLikeParkingLot(name: string): boolean {
  return /駐車場|パーキング|ﾊﾟｰｷﾝｸﾞ|駐車スペース/u.test(name);
}

export type ParkingInfo = {
  /** 見出し・FAQ質問文に使う地名 */
  placeName: string;
  /** pet_info.parking を句点正規化したもの（DB値のまま・料金や台数は足さない） */
  parkingText: string;
  /** コースのどちら側にあるか・そこから歩き出せるか */
  structureText: string;
};

export function buildParkingInfo(
  route: Pick<RouteWithArea, "slug" | "name" | "pet_info">,
  spots: Pick<RouteSpot, "name" | "category" | "spot_type">[]
): ParkingInfo {
  const placeName = routePlaceName(route);
  const parkingText = endWithPeriod(route.pet_info?.parking);

  const parkingSpots = spots.filter((s) => s.category === "parking");
  const startSpot = parkingSpots.find((s) => s.spot_type === "start");
  const endSpot = parkingSpots.find((s) => s.spot_type === "end");

  let structureText = "";
  if (startSpot) {
    const startBase = parkingBaseName(startSpot.name);
    const endBase = endSpot ? parkingBaseName(endSpot.name) : "";
    // 「一碧湖 駐車場」と「一碧湖 駐車場（ゴール）」のように実体が同じなら周回コース扱い。
    const startKey = parkingCompareKey(startSpot.name);
    const endKey = endSpot ? parkingCompareKey(endSpot.name) : "";
    const isLoop = Boolean(endKey) && (endKey.includes(startKey) || startKey.includes(endKey));
    // ⚠️ 「◯◯に停められる」とは書かない。category='parking' のスポットには駅・港・橋など
    //    「この付近に停めて歩き出す目印」も含まれるため、コース構造の事実だけを述べる。
    structureText = `コースは${startBase}から歩き出します。`;
    if (isLoop) {
      structureText += "歩き終えると出発地点に戻る周回コースです。";
    } else if (endBase) {
      structureText += `ゴールは${endBase}です。`;
    }
  } else if (endSpot && looksLikeParkingLot(endSpot.name)) {
    // 出発側に駐車場が無いケース。ゴール側が駐車場そのものの時だけ触れる
    // （「中目黒駅」等の発着点マーカーを駐車場の見出し下に置かない）。
    structureText = `コースのゴールは${parkingBaseName(endSpot.name)}です。`;
  }

  return { placeName, parkingText, structureText };
}
