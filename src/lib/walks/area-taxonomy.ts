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

/**
 * 箱根サブエリアの代表座標（/hakone「箱根エリアマップ」のピン位置）。
 *
 * 🔴 正本は Supabase `areas.center_point`（PostGIS geography）。ここはその写しであり、
 *    表示専用。**エリアを増減した／`center_point` を動かしたときは、ここも必ず更新する。**
 *    照合 SQL（最終照合 2026-08-30・6件すべて一致）:
 *      select slug, ST_Y(center_point::geometry) as lat, ST_X(center_point::geometry) as lng
 *        from areas where group_key = 'hakone' order by slug;
 *
 * DB から直接読まない理由: PostgREST は geography を WKB hex で返すため、view か RPC を
 * 新設しないと lat/lng を取れない（＝匿名に露出する公開スキーマの面が増える）。表示専用の
 * 6件のためにその面を増やすより、`HAKONE_SUB_AREA_ORDER` と同じ「定数で持つ」作法に揃える。
 *
 * ここに無い slug のエリアはピンを打たない（地図から静かに落ちるだけで、ページは壊れない）。
 */
export const HAKONE_AREA_CENTERS: Record<string, { lat: number; lng: number }> = {
  "hakone-yumoto": { lat: 35.2328, lng: 139.1071 },
  "hakone-miyanoshita": { lat: 35.238, lng: 139.045 },
  "hakone-gora": { lat: 35.248, lng: 139.035 },
  "hakone-sengokuhara": { lat: 35.27, lng: 139.0268 },
  "hakone-ashinoko": { lat: 35.208, lng: 139.018 },
  // 公開ルート0本のため現状 /hakone には描画されないが、正本に存在するので写しも持つ。
  "hakone-shuhen": { lat: 35.209, lng: 139.049 },
};

/**
 * 箱根グループのエリア slug 一覧（DB `areas.group_key='hakone'` の写し）。
 * 正本は Supabase。最終照合 2026-09-02（6件すべて一致）:
 *   select slug from areas where group_key = 'hakone' order by slug;
 *
 * `HAKONE_AREA_CENTERS` が同じ6件を持つため、そこから導出して二重定義を作らない。
 * エリアを増減したときは `HAKONE_AREA_CENTERS` を直せば、この一覧も追随する。
 */
export const HAKONE_AREA_SLUGS: readonly string[] = Object.keys(HAKONE_AREA_CENTERS);

/**
 * このエリアが箱根グループかどうか（/hakone/dog-map への文脈リンクの出し分けに使う）。
 *
 * DB から `group_key` を読み直さない理由: ルート詳細・エリア詳細の既存クエリは
 * `areas(id, name, slug, prefecture, description)` で列を絞っており、
 * リンク1本のために選択列と RSC ペイロードを増やしたくないため。
 */
export function isHakoneAreaSlug(slug: string | null | undefined): boolean {
  return !!slug && HAKONE_AREA_SLUGS.includes(slug);
}
