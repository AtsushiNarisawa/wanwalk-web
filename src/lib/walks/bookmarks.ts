/**
 * ルート保存（行きたいリスト）の localStorage ヘルパー
 *
 * - 登録不要の「軽い出口」: 端末のブラウザにのみ保存される（サーバー送信なし）
 * - RouteActions（保存ボタン）と /saved（行きたいリスト）で共有
 */

const STORAGE_KEY = "wanwalk_bookmarks";

type BookmarkStorage = { routeIds: string[]; updatedAt: string };

export function readBookmarkIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BookmarkStorage;
    return Array.isArray(parsed.routeIds) ? parsed.routeIds : [];
  } catch {
    return [];
  }
}

export function writeBookmarkIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const data: BookmarkStorage = {
      routeIds: ids,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // private mode 等で書き込み不可の場合は黙って無視
  }
}
