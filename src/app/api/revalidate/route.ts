import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type RevalidateBody = {
  paths?: string[];
  secret?: string;
};

// 再生成対象として許可するパスのパターン
// 任意パスの再生成を許可すると攻撃面が広がるため、事前にホワイトリスト化
const ALLOWED_PATH_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/areas$/,
  /^\/areas\/[a-z0-9-]+$/,
  /^\/spots$/,
  /^\/spots\/[a-z0-9-]+$/,
  /^\/routes\/[a-z0-9-]+$/,
  /^\/sitemap\.xml$/,
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATH_PATTERNS.some((re) => re.test(path));
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not configured" },
      { status: 500 }
    );
  }

  let body: RevalidateBody;
  try {
    body = (await req.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const paths = Array.isArray(body.paths) ? body.paths : [];
  if (paths.length === 0) {
    return NextResponse.json({ ok: false, error: "paths is empty" }, { status: 400 });
  }

  const revalidated: string[] = [];
  const skipped: string[] = [];

  for (const path of paths) {
    if (typeof path !== "string" || !isAllowedPath(path)) {
      skipped.push(path);
      continue;
    }
    try {
      revalidatePath(path);
      revalidated.push(path);
    } catch {
      skipped.push(path);
    }
  }

  return NextResponse.json({
    ok: true,
    revalidated,
    skipped,
    now: Date.now(),
  });
}
