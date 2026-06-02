/**
 * 距離表記の Single Source of Truth（Web 側）。
 *
 * DESIGN_TOKENS.md §9 / 2026-06-02 CEO 確定（F26 再検討の結果・B案）:
 * 散歩アプリ（非フィットネス）として、ルート総距離はメートル精度を出さず km に統一する。
 * 競合調査で犬散歩アプリ onedog・AllTrails が「1km 未満も 0.6km」表記だったことを根拠に採用。
 *
 * - ルート総距離（カード/SpecBar/詳細/メタ/OG）→ `formatDistance`：
 *   常に km・小数第1位。1km 未満も km（例: 432 → "0.4km" / 4340 → "4.3km" / 10112 → "10.1km"）。
 * - マップ内のスポットまでの距離（タイムライン）→ `formatSpotDistance`：
 *   1km 未満は整数 m（例: 40 → "40m" / 605 → "605m"）、1km 以上は小数1位 km。
 *   ここで km 統一すると先頭スポットが "0.0km" になり機能不全になるため m/km 切替を維持する
 *   （komoot / AllTrails も「総距離=km・区間=m」で使い分ける慣習）。
 *
 * `distance_meters` は DB では numeric（"432.00" 等の文字列で届くことがある）。
 * 生クエリ（OG 画像ルート等）でも安全なよう Number + Math.round で整数 m に正規化する。
 */

/** ルート総距離。常に km・小数第1位（1km 未満も "0.4km"）。 */
export function formatDistance(meters: number | string): string {
  const m = Math.round(Number(meters));
  if (!Number.isFinite(m)) return "—";
  return `${(m / 1000).toFixed(1)}km`;
}

/** nullable 用ヘルパ。NULL / 0 以下は "—" を返す。 */
export function formatDistanceOrDash(meters: number | string | null | undefined): string {
  if (meters == null) return "—";
  const m = Number(meters);
  if (!Number.isFinite(m) || m <= 0) return "—";
  return formatDistance(m);
}

/** スポットまでの距離（タイムライン用）。1km 未満は整数 m、1km 以上は小数1位 km。 */
export function formatSpotDistance(meters: number | string): string {
  const m = Math.round(Number(meters));
  if (!Number.isFinite(m)) return "—";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}
