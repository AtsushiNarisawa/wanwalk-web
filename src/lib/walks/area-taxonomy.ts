/**
 * エリア・タクソノミー定数（AREA_TAXONOMY_SPEC.md の正本に対応）。
 *
 * Web の /areas は「都道府県軸」を維持（SEO 資産）。
 * 都道府県の並びは需要順とし、App 側（area_taxonomy.dart の kPrefectureOrder）と
 * 同じ順序を共有して二重定義ズレを防ぐ。
 */

/** 都道府県の需要順。ここに無い県は末尾であいうえお順。 */
export const PREFECTURE_ORDER = [
  "神奈川県",
  "東京都",
  "山梨県",
  "静岡県",
  "埼玉県",
  "栃木県",
  "長野県",
  "千葉県",
  "群馬県",
  "茨城県",
] as const;

/** 都道府県の並び順 index（未掲載は大きい値＝末尾）。 */
export function prefectureOrderIndex(prefecture: string): number {
  const i = (PREFECTURE_ORDER as readonly string[]).indexOf(prefecture);
  return i < 0 ? 9999 : i;
}

/**
 * 箱根サブエリアの地理順（湯本→宮ノ下→強羅→仙石原→芦ノ湖）。
 * /hakone ハブのセクション並び順に使用。
 * 5件はすべて group_key='hakone' / tier='sub'（AREA_TAXONOMY_SPEC.md・DB実査確認済）。
 */
export const HAKONE_SUB_AREA_ORDER = [
  "hakone-yumoto",
  "hakone-miyanoshita",
  "hakone-gora",
  "hakone-sengokuhara",
  "hakone-ashinoko",
] as const;
