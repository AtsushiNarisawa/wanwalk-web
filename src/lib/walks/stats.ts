import "server-only";
import { cache } from "react";
import { createServerClient } from "./supabase";

// サイト全体の表示件数（公開コース数・対応エリア数・スポット数・平均ストーリー字数）の
// Single Source of Truth。about / トップ / routes / areas のメタや本文に散在していた
// ハードコード件数（74本・26エリア・473件・平均468字）を一本化し、DB から都度集計する。
// これによりコース増減時に各ページのコピーを手で書き換える必要がなくなる（W13）。
export type SiteStats = {
  /** 公開ルート総数（例: 74） */
  routeCount: number;
  /** 公開ルートを 1 本以上持つエリア数（= 対応エリア。例: 26） */
  areaCount: number;
  /** 公開ルート配下のスポット総数（例: 473） */
  spotCount: number;
  /** 公開ルートの体験ストーリー（description）平均文字数（例: 468） */
  avgStoryLength: number;
};

// React cache で同一リクエスト内（generateMetadata と本文の二重呼び出し等）の
// クエリ重複を排除する。
export const getSiteStats = cache(async (): Promise<SiteStats> => {
  const supabase = createServerClient();

  const [routesRes, spotsRes] = await Promise.all([
    // 公開ルートの area_id と description だけを取得（〜74 行・軽量）
    supabase
      .from("official_routes")
      .select("area_id, description")
      .eq("is_published", true),
    // 公開ルート配下のスポット件数のみ（!inner + head:true で行は取得しない）
    supabase
      .from("route_spots")
      .select("id, official_routes!inner(is_published)", { count: "exact", head: true })
      .eq("official_routes.is_published", true),
  ]);

  if (routesRes.error) {
    console.error("getSiteStats routes error", routesRes.error);
  }
  if (spotsRes.error) {
    console.error("getSiteStats spots error", spotsRes.error);
  }

  const routes = (routesRes.data ?? []) as { area_id: string | null; description: string | null }[];

  const areaIds = new Set<string>();
  let storyTotal = 0;
  let storyCount = 0;
  for (const r of routes) {
    if (r.area_id) areaIds.add(r.area_id);
    if (r.description && r.description.length > 0) {
      storyTotal += r.description.length;
      storyCount += 1;
    }
  }

  return {
    routeCount: routes.length,
    areaCount: areaIds.size,
    spotCount: spotsRes.count ?? 0,
    avgStoryLength: storyCount > 0 ? Math.round(storyTotal / storyCount) : 0,
  };
});
