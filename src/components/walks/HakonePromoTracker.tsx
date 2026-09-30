"use client";

/**
 * HakoneDogMapPromo（箱根「以外」のページ → /hakone/dog-map の送客導線）の計測だけを持つ部品。
 * 表示と文言はサーバーコンポーネント側（HakoneDogMapPromo）に残し、ここは children を包むだけ。
 *
 * ■ 送るイベント（2026-09-30）
 *   - hakone_promo_view : 導線がビューポートに入った時に 1 ページ 1 回だけ。
 *   - hakone_promo_click: 導線内の /hakone/dog-map へのリンクを押した時。
 *   パラメータは GA4 登録済みのカスタムディメンション
 *   （source_page / route_slug / area_slug / spot_slug / placement）だけを使う＝追加登録は不要。
 *
 * ■ なぜ view も取るか
 *   9/7〜9/29 の実測で「導線が見られていない（最下部に届くのは約23%）」のか
 *   「見られても押されない」のかを切り分けられなかったため。view が分母、click が分子。
 */
import { useEffect, useRef, type ReactNode } from "react";
import { trackEvent, type SourcePage } from "@/lib/analytics";

export type HakonePromoTrackingProps = {
  sourcePage: Extract<SourcePage, "route_detail" | "area_detail" | "spot_detail">;
  /** 置き場所の識別子（位置を動かした時に前後比較できるようにする）。 */
  placement: string;
  routeSlug?: string | null;
  areaSlug?: string | null;
  spotSlug?: string | null;
};

export default function HakonePromoTracker({
  children,
  sourcePage,
  placement,
  routeSlug,
  areaSlug,
  spotSlug,
}: HakonePromoTrackingProps & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const viewed = useRef(false);

  const params = {
    source_page: sourcePage,
    placement,
    route_slug: routeSlug,
    area_slug: areaSlug,
    spot_slug: spotSlug,
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || viewed.current) return;
    // IntersectionObserver が無い環境では view を送らない（推測で「見た」扱いにしない）。
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (viewed.current) return;
        if (entries.some((e) => e.isIntersecting)) {
          viewed.current = true;
          trackEvent("hakone_promo_view", params);
          io.disconnect();
        }
      },
      // 見出しと説明文が目に入る程度（要素の半分）で「見た」とみなす。
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
    // params は描画ごとに作り直すが、中身は props と同値。props 変化時だけ張り直す。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcePage, placement, routeSlug, areaSlug, spotSlug]);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (!a) return;
        if (a.getAttribute("href") !== "/hakone/dog-map") return;
        trackEvent("hakone_promo_click", params);
      }}
    >
      {children}
    </div>
  );
}
