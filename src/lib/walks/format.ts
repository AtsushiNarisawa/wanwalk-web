/**
 * 距離表記の Single Source of Truth（Web 側）。
 *
 * App `wanwalk-app/lib/utils/distance_formatter.dart` と同一仕様に揃える
 * （DESIGN_TOKENS.md §9 / 2026-06-01 CEO 確定 F26）:
 * - 1km 未満は `XXXm`（例: 432 → "432m"）
 * - 1km 以上は `X.Xkm`（例: 4340 → "4.3km" / 3657 → "3.7km" / 10112 → "10.1km"）
 *
 * `distance_meters` は DB では numeric（"432.00" 等の文字列で届くことがある）。
 * 生クエリ（OG 画像ルート等）でも安全なよう Number + Math.round で整数 m に正規化する。
 */
export function formatDistance(meters: number | string): string {
  const m = Math.round(Number(meters));
  if (!Number.isFinite(m)) return "—";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

/** nullable 用ヘルパ。NULL / 0 以下は "—" を返す。 */
export function formatDistanceOrDash(meters: number | string | null | undefined): string {
  if (meters == null) return "—";
  const m = Number(meters);
  if (!Number.isFinite(m) || m <= 0) return "—";
  return formatDistance(m);
}
