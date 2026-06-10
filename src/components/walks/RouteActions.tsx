"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookmarkSimple } from "@phosphor-icons/react";
import ShareMenu from "./ShareMenu";
import { trackEvent } from "@/lib/analytics";
import {
  readBookmarkIds as readBookmarks,
  writeBookmarkIds as writeBookmarks,
} from "@/lib/walks/bookmarks";

type Props = {
  routeId: string;
  routeSlug: string;
  routeName: string;
  areaName: string;
};

export default function RouteActions({ routeId, routeSlug, routeName, areaName }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR ハイドレーション回避の意図的な mounted ガード（localStorage 読み出し前）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setBookmarked(readBookmarks().includes(routeId));
  }, [routeId]);

  const toggleBookmark = () => {
    const ids = readBookmarks();
    const adding = !ids.includes(routeId);
    const next = adding ? [...ids, routeId] : ids.filter((x) => x !== routeId);
    writeBookmarks(next);
    setBookmarked(adding);
    trackEvent("route_bookmark_toggle", {
      route_slug: routeSlug,
      action: adding ? "add" : "remove",
      source_page: "route_detail",
    });
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/routes/${routeSlug}`
    : `https://wanwalk.jp/routes/${routeSlug}`;
  const shareText = `${routeName} - ${areaName}の犬連れ散歩ルート`;

  if (!mounted) {
    return <div style={{ display: "flex", gap: 8, minHeight: 40 }} aria-hidden />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
        shareKind="route"
        shareTargetSlug={routeSlug}
      />
      </div>

      {bookmarked && (
        <Link
          href="/saved"
          className="inline-flex items-center gap-1"
          style={{
            fontSize: 12,
            color: "var(--color-ww-accent)",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          行きたいリストを見る
          <ArrowRight size={12} weight="regular" />
        </Link>
      )}

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
