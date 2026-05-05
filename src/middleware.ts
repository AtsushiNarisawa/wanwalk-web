import { NextRequest, NextResponse } from "next/server";
import { GONE_SPOT_SLUGS, RENAMED_SPOT_SLUGS } from "@/lib/gone-slugs";

// /spots/{slug} に対する 301/410 ハンドリング:
// (1) RENAMED_SPOT_SLUGS に該当する旧 slug は新 slug へ 301 redirect
//     → GSC で稼いでいる検索インプレッション・クリックを新 slug に引き継げる
// (2) GONE_SPOT_SLUGS に該当する slug は 410 Gone を返して Google からの削除を加速
//     → 404 でも最終的には削除されるが、410 は「明示的に削除された」とみなされ削除が早い
// (3) それ以外は通常レンダリング（Next.js が処理）
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/spots\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();

  const slug = decodeURIComponent(match[1]);

  // (1) リネーム → 301 redirect
  const renamed = RENAMED_SPOT_SLUGS.get(slug);
  if (renamed) {
    const target = new URL(`/spots/${renamed}`, request.url);
    return NextResponse.redirect(target, 301);
  }

  // (2) 削除済み → 410 Gone
  if (GONE_SPOT_SLUGS.has(slug)) {
    return new NextResponse("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/spots/:slug*",
};
