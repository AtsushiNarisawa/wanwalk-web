"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkSimple, X } from "@phosphor-icons/react";
import RouteCard from "./RouteCard";
import { wanwalkSupabase } from "@/lib/walks/supabase";
import { readBookmarkIds, writeBookmarkIds } from "@/lib/walks/bookmarks";
import { trackEvent } from "@/lib/analytics";
import type { RouteWithArea } from "@/types/walks";

type LoadState = "loading" | "loaded" | "error";

export default function SavedRoutesList() {
  const [routes, setRoutes] = useState<RouteWithArea[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    const ids = readBookmarkIds();
    if (ids.length === 0) {
      setState("loaded");
      trackEvent("saved_list_view", { saved_count: 0 });
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await wanwalkSupabase
        .from("official_routes")
        .select(
          "id, area_id, name, slug, description, difficulty_level, distance_meters, estimated_minutes, thumbnail_url, total_walks, is_published, areas(id, name, slug, prefecture, description)"
        )
        .in("id", ids)
        .eq("is_published", true);

      if (cancelled) return;
      if (error) {
        setState("error");
        return;
      }

      const found = (data ?? []) as unknown as RouteWithArea[];
      // 保存が新しい順に表示（localStorage は追加順の配列）
      const order = new Map(ids.map((id, i) => [id, i]));
      found.sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0));
      setRoutes(found);
      setState("loaded");
      trackEvent("saved_list_view", { saved_count: found.length });

      // 非公開化されたルートは取得結果から消えるので、保存リスト側も掃除する
      const foundIds = new Set(found.map((r) => r.id));
      const pruned = ids.filter((id) => foundIds.has(id));
      if (pruned.length !== ids.length) writeBookmarkIds(pruned);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const removeRoute = (route: RouteWithArea) => {
    const next = readBookmarkIds().filter((id) => id !== route.id);
    writeBookmarkIds(next);
    setRoutes((prev) => prev.filter((r) => r.id !== route.id));
    trackEvent("route_bookmark_toggle", {
      route_slug: route.slug,
      action: "remove",
      source_page: "saved_list",
    });
  };

  if (state === "loading") {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        aria-busy
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[4/3]"
            style={{
              backgroundColor: "var(--color-ww-bg-tertiary)",
              borderRadius: "var(--radius-ww-md)",
            }}
          />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <p
        className="text-center py-12"
        style={{ fontSize: 15, color: "var(--color-ww-text-tertiary)" }}
      >
        リストの読み込みに失敗しました。時間をおいて再度お試しください。
      </p>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-16">
        <BookmarkSimple
          size={40}
          weight="regular"
          style={{ color: "var(--color-ww-text-tertiary)", margin: "0 auto" }}
        />
        <p
          className="mt-4"
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          保存した散歩コースはまだありません。
          <br />
          各コースページの「保存」ボタンから、気になるコースを追加できます。
        </p>
        <div className="mt-8">
          <Link
            href="/routes"
            style={{
              fontSize: 14,
              color: "var(--color-ww-accent)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              borderBottom: "1px solid var(--color-ww-accent)",
              paddingBottom: 2,
            }}
          >
            散歩コースを探す
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
      {routes.map((route) => (
        <li key={route.id} className="relative">
          <RouteCard route={route} sourcePage="saved_list" />
          <button
            type="button"
            onClick={() => removeRoute(route)}
            aria-label={`${route.name}をリストから外す`}
            title="リストから外す"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "var(--radius-ww-sm)",
              border: "1px solid var(--color-ww-border-subtle)",
              backgroundColor: "var(--color-ww-bg)",
              color: "var(--color-ww-text-secondary)",
              cursor: "pointer",
            }}
          >
            <X size={16} weight="regular" />
          </button>
        </li>
      ))}
    </ul>
  );
}
