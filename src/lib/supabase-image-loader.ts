"use client";

const SUPABASE_PUBLIC_PREFIX = "/storage/v1/object/public/";
const SUPABASE_RENDER_PREFIX = "/storage/v1/render/image/public/";

export default function supabaseImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Supabase Image Transformations は width<400 のとき origin直配信扱いで
  // cache-control: no-cache を返すケースがある。最低400に丸めて長期キャッシュを取る。
  const safeWidth = Math.max(400, width);

  // ⚠️ resize=contain（Supabase 側 resizing_type=fit）を明示指定すること。
  // これを省略すると Supabase 側デフォルト（resizing_type=fill）が効き、
  // height 未指定時は「width だけ縮小・height は元画像のピクセル値のまま」という
  // アスペクト比が壊れた画像を返す（例: 2560x1706 の写真が 400x1706 になり、
  // 元画像の中央だけを縦に極端に引き伸ばして見せたような構図になる）。
  // ここで contain を指定し「アスペクト比を保ったまま width に収める」変換だけを
  // Supabase に行わせ、実際の見た目のクロップ（object-fit: cover 等）は
  // 各コンポーネント側の CSS に完全に委ねる。
  if (src.includes(SUPABASE_PUBLIC_PREFIX)) {
    const transformed = src.replace(
      SUPABASE_PUBLIC_PREFIX,
      SUPABASE_RENDER_PREFIX,
    );
    const url = new URL(transformed);
    url.searchParams.set("width", safeWidth.toString());
    url.searchParams.set("resize", "contain");
    url.searchParams.set("quality", (quality ?? 75).toString());
    return url.toString();
  }

  if (src.includes(SUPABASE_RENDER_PREFIX)) {
    const url = new URL(src);
    url.searchParams.set("width", safeWidth.toString());
    url.searchParams.set("resize", "contain");
    url.searchParams.set("quality", (quality ?? 75).toString());
    return url.toString();
  }

  return src;
}
