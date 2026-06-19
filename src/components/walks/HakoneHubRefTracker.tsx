"use client";

/**
 * /hakone ハブの ?ref=<utm_slug> 着地計測（B7）。
 *
 * ハブは ISR（静的/CDNキャッシュ）で配信するため、ref は server の searchParams ではなく
 * クライアントで useSearchParams() から読む。これにより force-dynamic にせず
 * （= CDN キャッシュ・SEO を維持しつつ）バナー/QR 着地を帰属できる。
 * 発火は DirectoryRefTracker（surface="hakone_hub"）に委譲＝1回だけ送信。
 */
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DirectoryRefTracker from "./DirectoryRefTracker";

const REF_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

function Inner() {
  const sp = useSearchParams();
  const raw = sp.get("ref") ?? "";
  const safeRef = REF_PATTERN.test(raw) ? raw : "";
  if (!safeRef) return null;
  return <DirectoryRefTracker refSlug={safeRef} surface="hakone_hub" />;
}

export default function HakoneHubRefTracker() {
  // useSearchParams() は静的レンダリング時に Suspense 境界が必要。
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
