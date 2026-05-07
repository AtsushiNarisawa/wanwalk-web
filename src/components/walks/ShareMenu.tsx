"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShareNetwork,
  LinkSimple,
  XLogo,
  FacebookLogo,
  Check,
} from "@phosphor-icons/react";

type Props = {
  url: string;
  text: string;
  title: string;
  size?: "sm" | "md";
};

export default function ShareMenu({ url, text, title, size = "md" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // fallthrough
      }
    }
    setMenuOpen((v) => !v);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  const height = size === "sm" ? 36 : 40;
  const padding = size === "sm" ? "0 12px" : "0 14px";

  if (!mounted) {
    return <div style={{ minHeight: height }} aria-hidden />;
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="共有"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="ww-share-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height,
          padding,
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
        <ShareNetwork size={size === "sm" ? 18 : 20} weight="regular" />
        <span className="ww-share-label">共有</span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: height + 8,
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
        .ww-share-btn:hover { border-color: var(--color-ww-accent) !important; }
        @media (max-width: 639px) {
          .ww-share-btn { padding: 0 !important; width: ${height}px !important; justify-content: center; }
          .ww-share-label { display: none; }
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
