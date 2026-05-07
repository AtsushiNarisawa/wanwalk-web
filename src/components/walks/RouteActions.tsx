"use client";

import { useEffect, useState } from "react";
import { BookmarkSimple } from "@phosphor-icons/react";
import ShareMenu from "./ShareMenu";

type Props = {
  routeId: string;
  routeSlug: string;
  routeName: string;
  areaName: string;
};

const STORAGE_KEY = "wanwalk_bookmarks";

type BookmarkStorage = { routeIds: string[]; updatedAt: string };

function readBookmarks(): string[] {
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

function writeBookmarks(ids: string[]) {
  const data: BookmarkStorage = { routeIds: ids, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function RouteActions({ routeId, routeSlug, routeName, areaName }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarked(readBookmarks().includes(routeId));
  }, [routeId]);

  const toggleBookmark = () => {
    const ids = readBookmarks();
    const next = ids.includes(routeId)
      ? ids.filter((x) => x !== routeId)
      : [...ids, routeId];
    writeBookmarks(next);
    setBookmarked(next.includes(routeId));
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/routes/${routeSlug}`
    : `https://wanwalk.jp/routes/${routeSlug}`;
  const shareText = `${routeName} - ${areaName}の犬連れ散歩コース`;

  if (!mounted) {
    return <div style={{ display: "flex", gap: 8, minHeight: 40 }} aria-hidden />;
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        onClick={toggleBookmark}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? "保存済み" : "保存"}
        className="route-action-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 40,
          padding: "0 14px",
          background: "transparent",
          border: `1px solid ${bookmarked ? "var(--color-ww-accent)" : "var(--color-ww-border-strong)"}`,
          borderRadius: "var(--radius-ww-md)",
          cursor: "pointer",
          color: bookmarked ? "var(--color-ww-accent)" : "var(--color-ww-text)",
          fontFamily: "var(--font-ww-sans)",
          fontSize: 14,
          fontWeight: 500,
          transition: "border-color 150ms",
        }}
      >
        <BookmarkSimple size={20} weight={bookmarked ? "fill" : "regular"} />
        <span className="route-action-label">{bookmarked ? "保存済み" : "保存"}</span>
      </button>

      <ShareMenu
        url={shareUrl}
        text={shareText}
        title={`${routeName} | WanWalk`}
      />

      <style>{`
        .route-action-btn:hover { border-color: var(--color-ww-accent) !important; }
        @media (max-width: 639px) {
          .route-action-btn { padding: 0 !important; width: 40px !important; justify-content: center; }
          .route-action-label { display: none; }
        }
      `}</style>
    </div>
  );
}
