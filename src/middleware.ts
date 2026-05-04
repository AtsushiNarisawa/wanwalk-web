import { NextRequest, NextResponse } from "next/server";
import { GONE_SPOT_SLUGS } from "@/lib/gone-slugs";

// /spots/{slug} のうち、過去にインデックスされたが現在 DB に存在しない slug は
// 410 Gone を返して Google からの削除を加速させる。
// 404 でも最終的には削除されるが、410 は「明示的に削除された」とみなされ削除が早い。
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/spots\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();

  const slug = decodeURIComponent(match[1]);
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
