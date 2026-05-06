import { NextRequest, NextResponse } from "next/server";
import { GONE_SPOT_SLUGS, RENAMED_SPOT_SLUGS } from "@/lib/gone-slugs";

// /spots/{slug}, /routes/{slug}, /areas/{slug} に対する 301/410 ハンドリング:
// (1) /spots: RENAMED_SPOT_SLUGS に該当する旧 slug は新 slug へ 301 redirect
//     → GSC で稼いでいる検索インプレッション・クリックを新 slug に引き継げる
// (2) /spots: GONE_SPOT_SLUGS に該当する slug は 410 Gone を返して Google からの削除を加速
//     → 404 でも最終的には削除されるが、410 は「明示的に削除された」とみなされ削除が早い
// (3) 全 dynamic セグメント: 非ASCII / 過長 slug は 410 Gone
//     → spot/route/area の slug は ASCII のみが正規 (project_p1_2_sitemap_fix_2026_05_04 で確定)
//       Next.js 16 では非ASCII の dynamic param が 500 を返す挙動があり、GSC で 5xx エラーになる。
//       middleware で先回りして 410 を返すことで、GSC からの削除を早め、5xx 計上も止める。
// (4) それ以外は通常レンダリング（Next.js が処理）

const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/i;
const MAX_SLUG_LENGTH = 100;

function goneResponse(): NextResponse {
  return new NextResponse("Gone", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/(spots|routes|areas)\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();

  const segment = match[1];
  let slug: string;
  try {
    slug = decodeURIComponent(match[2]);
  } catch {
    // 不正なパーセントエンコード → 即 410
    return goneResponse();
  }

  // (3) 非ASCII / 過長 slug は全 segment 共通で 410
  if (slug.length > MAX_SLUG_LENGTH || !VALID_SLUG.test(slug)) {
    return goneResponse();
  }

  if (segment === "spots") {
    // (1) リネーム → 301 redirect
    const renamed = RENAMED_SPOT_SLUGS.get(slug);
    if (renamed) {
      const target = new URL(`/spots/${renamed}`, request.url);
      return NextResponse.redirect(target, 301);
    }

    // (2) 削除済み → 410 Gone
    if (GONE_SPOT_SLUGS.has(slug)) {
      return goneResponse();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/spots/:slug*", "/routes/:slug*", "/areas/:slug*"],
};
