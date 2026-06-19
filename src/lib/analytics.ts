/**
 * GA4 click event tracking helper (P0③・Phase 2 SEO effect measurement)
 *
 * - layout.tsx の gtag('config', GA_ID, ...) で traffic_type:internal が
 *   set されている場合、event は GA4 側のフィルタで除外される設計。
 * - 念のため client 側でも localStorage('wanwalk_internal') を確認し、
 *   internal フラグ true なら送信自体をスキップする（防御的二重化）。
 * - SSR 時は window 不在で no-op。
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type SourcePage =
  | "home"
  | "areas_list"
  | "area_detail"
  | "routes_list"
  | "route_detail"
  | "spot_detail"
  | "spots_list"
  | "spots_category"
  | "saved_list"
  | "about"
  // 箱根 愛犬さんぽマップ ハブ（/hakone・DMOバナー着地点）。
  // source_page は GA4 登録済ディメンション。新値を載せるだけ（新規登録不要）。
  | "hakone_hub";

export type ShareChannel = "native" | "copy" | "x" | "facebook" | "line";

export type ShareKind = "route" | "area" | "spot";

export type TrackEventName =
  | "route_card_click"
  | "area_card_click"
  | "spot_card_click"
  | "route_bookmark_toggle"
  | "saved_list_view" // 行きたいリスト閲覧（保存・再訪=北極星の代理指標）
  | "share_open"
  | "share_channel_click"
  | "route_feedback_open"
  | "route_feedback_submit"
  | "filter_apply_season"
  | "filter_apply_cart"
  | "app_store_badge_click"
  // 箱根 犬連れおでかけマップβ（/hakone/dog-map）
  | "outbound_click" // 施設公式サイトへの外部クリック（送客の真実のソース）
  | "directory_route_click" // 施設カード → 最寄りルート（内部リンク）
  | "directory_qr_landing" // ホテルQR（?ref=）からの着地
  | "directory_correction_click"; // 施設情報の修正・削除依頼（アグリゲーター型の必須動線）

type EventParams = Record<string, string | number | boolean | undefined | null>;

function isInternalTraffic(): boolean {
  try {
    return localStorage.getItem("wanwalk_internal") === "true";
  } catch {
    return false;
  }
}

export function trackEvent(name: TrackEventName, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  if (isInternalTraffic()) return;
  if (typeof window.gtag !== "function") return;

  // GA4 推奨: undefined/null/空文字は除去（パラメータ枠を浪費しないため）
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    cleaned[key] = value;
  }

  window.gtag("event", name, cleaned);
}
