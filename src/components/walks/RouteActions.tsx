"use client";

import { useEffect, useState, useRef } from "react";
import {
  BookmarkSimple,
  ShareNetwork,
  LinkSimple,
  XLogo,
  FacebookLogo,
  Check,
} from "@phosphor-icons/react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setBookmarked(readBookmarks().includes(routeId));
  }, [routeId]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

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

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: `${routeName} | WanWalk`, text: shareText, url: shareUrl });
        return;
      } catch {
        // fallthrough to dropdown
      }
    }
    setMenuOpen((v) => !v);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;

  if (!mounted) {
    return (
      <div style={{ display: "flex", gap: 8, minHeight: 40 }} aria-hidden />
    );
  }

  return (
    <div ref={wrapperRef} style={{ display: "flex", gap: 8, position: "relative" }}>
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

      <button
        type="button"
        onClick={handleShare}
        aria-label="共有"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="route-action-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 40,
          padding: "0 14px",
          background: "transparent",
          border: "1px solid var(--color-ww-border-strong)",
          borderRadius: "var(--radius-ww-md)",
          cursor: "pointer",
          color: "var(--color-ww-text)",
          fontFamily: "var(--font-ww-sans)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <ShareNetwork size={20} weight="regular" />
        <span className="route-action-label">共有</span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            minWidth: 220,
            backgroundColor: "#fff",
            border: "1px solid var(--color-ww-border-subtle)",
            borderRadius: "var(--radius-ww-md)",
            boxShadow: "0 4px 16px rgba(42,42,42,0.08)",
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          <MenuItem onClick={copyUrl} icon={copied ? <Check size={18} /> : <LinkSimple size={18} />}>
            {copied ? "コピーしました" : "URLをコピー"}
          </MenuItem>
          <MenuLink href={xUrl} icon={<XLogo size={18} />}>Xで共有</MenuLink>
          <MenuLink href={fbUrl} icon={<FacebookLogo size={18} />}>Facebookで共有</MenuLink>
          <MenuLink href={lineUrl} icon={<LineIcon />}>LINEで共有</MenuLink>
        </div>
      )}

      <style>{`
        .route-action-btn:hover {
          border-color: var(--color-ww-accent) !important;
        }
        @media (max-width: 639px) {
          .route-action-btn {
            padding: 0 !important;
            width: 40px !important;
            justify-content: center;
          }
          .route-action-label { display: none; }
        }
      `}</style>
    </div>
  );
}

function MenuItem({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 14,
        color: "var(--color-ww-text)",
        fontFamily: "var(--font-ww-sans)",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="menuitem"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        fontSize: 14,
        color: "var(--color-ww-text)",
        textDecoration: "none",
        fontFamily: "var(--font-ww-sans)",
      }}
    >
      {icon}
      {children}
    </a>
  );
}

function LineIcon() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: "#06C755",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "var(--font-ww-sans)",
        letterSpacing: 0,
      }}
    >
      L
    </span>
  );
}
