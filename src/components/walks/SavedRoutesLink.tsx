"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkSimple } from "@phosphor-icons/react";
import { readBookmarkIds } from "@/lib/walks/bookmarks";

/**
 * 行きたいリスト（/saved）への入口リンク。
 * 保存が1件もない端末では何も表示しない（初見ユーザーのノイズにしない）。
 */
export default function SavedRoutesLink({
  align = "left",
}: {
  align?: "left" | "center";
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // SSR ハイドレーション回避のため mount 後に localStorage を読む
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(readBookmarkIds().length);
  }, []);

  if (count === 0) return null;

  return (
    <div style={{ textAlign: align }}>
      <Link
        href="/saved"
        className="inline-flex items-center gap-1.5"
        style={{
          fontSize: 13,
          color: "var(--color-ww-accent)",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        <BookmarkSimple size={16} weight="fill" />
        行きたいリスト（<span className="ww-numeric">{count}</span>件）
      </Link>
    </div>
  );
}
